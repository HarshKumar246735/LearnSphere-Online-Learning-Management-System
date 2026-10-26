import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Enrollment from '../models/Enrollment.js';
import Quiz from '../models/Quiz.js';
import Certificate from '../models/Certificate.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { isOwnerOrAdmin } from '../services/courseService.js';
import { computeProgress, syncCompletion } from '../services/progressService.js';
import { notify } from '../services/notificationService.js';

export const enroll = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') throw new AppError('Only student accounts can enroll in courses.', 403);
  const course = await Course.findOne({ _id: req.params.courseId, status: 'published' });
  if (!course) throw new AppError('Course not found.', 404);
  if (course.price > 0) throw new AppError('Checkout is not available yet, so paid courses cannot be purchased.', 402);
  try {
    await Enrollment.create({ student: req.user._id, course: course._id });
  } catch (err) {
    if (err.code === 11000) throw new AppError('You are already enrolled in this course.', 409);
    throw err;
  }
  await Course.updateOne({ _id: course._id }, { $inc: { enrollmentCount: 1 } });
  await notify([course.instructor], { type: 'enrollment', title: 'New enrollment', body: `${req.user.name} enrolled in ${course.title}.`, link: '/instructor/students' });
  return ok(res, { enrolled: true, slug: course.slug }, 201);
});

export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).sort('-updatedAt')
    .populate({ path: 'course', select: 'title slug thumbnail level lessonsCount durationMinutes status category instructor', populate: [{ path: 'instructor', select: 'name' }, { path: 'category', select: 'name slug' }] })
    .lean();
  const live = enrollments.filter((e) => e.course);
  const counts = await LessonProgress.aggregate([{ $match: { student: req.user._id } }, { $group: { _id: '$course', n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return ok(res, live.map((e) => {
    const done = Math.min(map.get(String(e.course._id)) || 0, e.course.lessonsCount);
    return { _id: e._id, status: e.status, enrolledAt: e.createdAt, completedAt: e.completedAt, lastLessonId: e.lastLessonId, course: e.course,
      completedLessons: done, percent: e.course.lessonsCount ? Math.round((done / e.course.lessonsCount) * 100) : 0 };
  }));
});

export const courseProgress = asyncHandler(async (req, res) => {
  if (!(await Enrollment.exists({ student: req.user._id, course: req.params.courseId }))) throw new AppError('You are not enrolled in this course.', 403);
  return ok(res, await computeProgress(req.user._id, req.params.courseId));
});

export const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) throw new AppError('Lesson not found.', 404);
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: lesson.course });
  if (!enrollment) throw new AppError('Enroll in this course before completing its lessons.', 403);
  // Completion is confirmed by the learner. Opening a lesson never counts as having watched it.
  await LessonProgress.updateOne({ student: req.user._id, lesson: lesson._id }, { $setOnInsert: { course: lesson.course, completedAt: new Date() } }, { upsert: true });
  enrollment.lastLessonId = lesson._id;
  await enrollment.save();
  return ok(res, await syncCompletion(req.user._id, lesson.course));
});

export const getLearnContent = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate('instructor', 'name avatar headline').populate('category', 'name slug').lean();
  if (!course) throw new AppError('Course not found.', 404);
  const manager = isOwnerOrAdmin(req.user, course);
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id }).lean();
  if (!enrollment && !manager) throw new AppError('Enroll in this course to open its lessons.', 403);
  if (course.status !== 'published' && !manager) throw new AppError('This course is not available right now.', 404);

  const [sections, lessons, quizzes] = await Promise.all([
    Section.find({ course: course._id }).sort('order').lean(),
    Lesson.find({ course: course._id }).sort('order').lean(),
    Quiz.find({ course: course._id }).select('title lesson isRequired timeLimitMinutes passingScore maxAttempts').lean(),
  ]);
  const bySection = {};
  lessons.forEach((l) => { (bySection[l.section] ||= []).push(l); });
  const progress = enrollment ? await computeProgress(req.user._id, course._id) : null;
  const certificate = enrollment ? await Certificate.findOne({ student: req.user._id, course: course._id }).select('certificateId').lean() : null;
  const { description, learningObjectives, prerequisites, ...courseInfo } = course; // keep the payload lean
  return ok(res, {
    course: courseInfo,
    sections: sections.map((s) => ({ ...s, lessons: bySection[s._id] || [] })),
    quizzes: quizzes.map((q) => ({ ...q, passed: progress ? progress.passedQuizIds.includes(String(q._id)) : false })),
    progress, lastLessonId: enrollment?.lastLessonId || null, certificateId: certificate?.certificateId || null, isPreviewMode: !enrollment,
  });
});
