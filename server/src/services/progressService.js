import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import crypto from 'node:crypto';
import { notify } from './notificationService.js';

export async function computeProgress(studentId, courseId) {
  const [lessons, done, requiredQuizzes] = await Promise.all([
    Lesson.find({ course: courseId }).select('_id').lean(),
    LessonProgress.find({ student: studentId, course: courseId }).select('lesson').lean(),
    Quiz.find({ course: courseId, isRequired: true }).select('_id').lean(),
  ]);
  const valid = new Set(lessons.map((l) => String(l._id)));
  const completedLessonIds = [...new Set(done.map((d) => String(d.lesson)))].filter((id) => valid.has(id));
  const passed = requiredQuizzes.length
    ? await QuizAttempt.distinct('quiz', { student: studentId, quiz: { $in: requiredQuizzes.map((q) => q._id) }, status: 'submitted', passed: true })
    : [];
  const passedSet = new Set(passed.map(String));
  const totalLessons = lessons.length;
  const requiredQuizzesPassed = requiredQuizzes.every((q) => passedSet.has(String(q._id)));
  return {
    completedLessonIds,
    completedLessons: completedLessonIds.length,
    totalLessons,
    percent: totalLessons ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0,
    requiredQuizzes: requiredQuizzes.length,
    requiredQuizzesPassed,
    passedQuizIds: [...passedSet],
    eligibleForCertificate: totalLessons > 0 && completedLessonIds.length === totalLessons && requiredQuizzesPassed,
  };
}

const newCertificateId = () => `LS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

// Recomputes progress from the database and, when every requirement is met, completes the enrollment and issues
// exactly one certificate. Nothing here trusts client state.
export async function syncCompletion(studentId, courseId) {
  const progress = await computeProgress(studentId, courseId);
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  let certificate = await Certificate.findOne({ student: studentId, course: courseId });

  if (progress.eligibleForCertificate && enrollment) {
    if (enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      await enrollment.save();
    }
    if (!certificate) {
      const [student, course] = await Promise.all([User.findById(studentId), Course.findById(courseId).populate('instructor', 'name')]);
      try {
        certificate = await Certificate.create({
          certificateId: newCertificateId(), student: studentId, course: courseId,
          studentName: student.name, courseTitle: course.title, instructorName: course.instructor.name,
        });
        await notify([studentId], { type: 'certificate', title: 'Certificate issued', body: `You completed ${course.title}.`, link: '/student/certificates' });
        await notify([course.instructor._id], { type: 'completion', title: 'A student completed your course', body: `${student.name} finished ${course.title}.`, link: '/instructor/students' });
      } catch (err) {
        if (err.code !== 11000) throw err; // a parallel request already issued it
        certificate = await Certificate.findOne({ student: studentId, course: courseId });
      }
    }
  }
  return { ...progress, status: enrollment?.status || null, certificateId: certificate?.certificateId || null };
}
