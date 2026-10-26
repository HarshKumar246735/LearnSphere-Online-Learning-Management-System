import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { isOwnerOrAdmin, loadOwnedCourse } from '../services/courseService.js';
import { syncCompletion } from '../services/progressService.js';
import { notify } from '../services/notificationService.js';

const GRACE_MS = 30 * 1000;

// Students never receive correct answers or explanations before they submit.
const forStudent = (quiz) => ({
  _id: quiz._id, course: quiz.course, title: quiz.title, description: quiz.description, passingScore: quiz.passingScore,
  timeLimitMinutes: quiz.timeLimitMinutes, maxAttempts: quiz.maxAttempts, isRequired: quiz.isRequired,
  questions: quiz.questions.map((q) => ({ _id: q._id, prompt: q.prompt, options: q.options })),
});

async function loadQuiz(quizId) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found.', 404);
  return quiz;
}

async function assertLessonInCourse(lessonId, courseId) {
  if (lessonId && !(await Lesson.exists({ _id: lessonId, course: courseId }))) throw new AppError('That lesson does not belong to this course.', 400);
}

export const createQuiz = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.courseId, req.user);
  await assertLessonInCourse(req.body.lesson, course._id);
  const quiz = await Quiz.create({ ...req.body, course: course._id });
  return ok(res, { quiz }, 201);
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await loadQuiz(req.params.quizId);
  await loadOwnedCourse(quiz.course, req.user);
  await assertLessonInCourse(req.body.lesson, quiz.course);
  Object.entries(req.body).forEach(([k, v]) => { quiz[k] = v; });
  await quiz.save();
  return ok(res, { quiz });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await loadQuiz(req.params.quizId);
  await loadOwnedCourse(quiz.course, req.user);
  await Promise.all([QuizAttempt.deleteMany({ quiz: quiz._id }), quiz.deleteOne()]);
  return ok(res, { deleted: true });
});

export const myQuizzes = asyncHandler(async (req, res) => {
  const courses = await Course.find(req.user.role === 'admin' ? {} : { instructor: req.user._id }).select('title slug').lean();
  const quizzes = await Quiz.find({ course: { $in: courses.map((c) => c._id) } }).sort('-updatedAt').lean();
  const names = new Map(courses.map((c) => [String(c._id), c]));
  const stats = await QuizAttempt.aggregate([
    { $match: { quiz: { $in: quizzes.map((q) => q._id) }, status: 'submitted' } },
    { $group: { _id: '$quiz', attempts: { $sum: 1 }, avgScore: { $avg: '$score' }, passed: { $sum: { $cond: ['$passed', 1, 0] } } } },
  ]);
  const statMap = new Map(stats.map((s) => [String(s._id), s]));
  return ok(res, quizzes.map((q) => ({ ...q, course: names.get(String(q.course)), questionCount: q.questions.length,
    stats: { attempts: statMap.get(String(q._id))?.attempts || 0, avgScore: Math.round(statMap.get(String(q._id))?.avgScore || 0), passed: statMap.get(String(q._id))?.passed || 0 } })));
});

export const enrolledQuizzes = asyncHandler(async (req, res) => {
  const courseIds = await Enrollment.find({ student: req.user._id }).distinct('course');
  const [quizzes, attempts] = await Promise.all([
    Quiz.find({ course: { $in: courseIds } }).populate('course', 'title slug').lean(),
    QuizAttempt.find({ student: req.user._id, status: 'submitted' }).select('quiz score passed submittedAt').lean(),
  ]);
  return ok(res, quizzes.map((q) => {
    const mine = attempts.filter((a) => String(a.quiz) === String(q._id));
    return { _id: q._id, title: q.title, course: q.course, questionCount: q.questions.length, passingScore: q.passingScore, isRequired: q.isRequired,
      timeLimitMinutes: q.timeLimitMinutes, maxAttempts: q.maxAttempts, attemptsUsed: mine.length,
      bestScore: mine.length ? Math.max(...mine.map((a) => a.score)) : null, passed: mine.some((a) => a.passed) };
  }));
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await loadQuiz(req.params.quizId);
  const course = await Course.findById(quiz.course);
  if (isOwnerOrAdmin(req.user, course)) return ok(res, { quiz, canEdit: true }); // owners see answers so they can edit
  if (!(await Enrollment.exists({ student: req.user._id, course: course._id }))) throw new AppError('Enroll in this course to open its quizzes.', 403);
  return ok(res, { quiz: forStudent(quiz), canEdit: false });
});

async function expireIfLate(attempt, quiz) {
  if (attempt && quiz.timeLimitMinutes && Date.now() > attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60000 + GRACE_MS) {
    attempt.status = 'expired';
    await attempt.save();
    return null;
  }
  return attempt;
}

export const startAttempt = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') throw new AppError('Only students can take quizzes.', 403);
  const quiz = await loadQuiz(req.params.quizId);
  if (!(await Enrollment.exists({ student: req.user._id, course: quiz.course }))) throw new AppError('Enroll in this course to take its quizzes.', 403);

  let attempt = await expireIfLate(await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id, status: 'in_progress' }), quiz);
  const used = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id, status: { $in: ['submitted', 'expired'] } });
  if (!attempt) {
    if (quiz.maxAttempts && used >= quiz.maxAttempts) throw new AppError('You have used all attempts for this quiz.', 403);
    attempt = await QuizAttempt.create({ quiz: quiz._id, student: req.user._id, course: quiz.course, totalQuestions: quiz.questions.length });
  }
  const expiresAt = quiz.timeLimitMinutes ? new Date(attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60000) : null;
  return ok(res, { attemptId: attempt._id, startedAt: attempt.startedAt, expiresAt, attemptsUsed: used, quiz: forStudent(quiz) });
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const quiz = await loadQuiz(req.params.quizId);
  const { attemptId, answers } = req.body;
  // Atomic claim: a double-click or a replayed request cannot submit the same attempt twice.
  const attempt = await QuizAttempt.findOneAndUpdate(
    { _id: attemptId, quiz: quiz._id, student: req.user._id, status: 'in_progress' },
    { status: 'submitted', submittedAt: new Date() }, { new: false },
  );
  if (!attempt) throw new AppError('This attempt is not open. Start the quiz again.', 409);
  if (quiz.timeLimitMinutes && Date.now() > attempt.startedAt.getTime() + quiz.timeLimitMinutes * 60000 + GRACE_MS) {
    await QuizAttempt.updateOne({ _id: attempt._id }, { status: 'expired' });
    throw new AppError('Time is up. This attempt was not scored.', 400);
  }
  if (answers.length !== quiz.questions.length) {
    await QuizAttempt.updateOne({ _id: attempt._id }, { status: 'in_progress', submittedAt: null });
    throw new AppError('Answer every question slot (use null to skip a question).', 400);
  }

  // The score is always computed here from the stored answer key.
  const results = quiz.questions.map((q, i) => {
    const selected = answers[i] ?? null;
    return { questionId: q._id, selectedIndex: selected, correct: selected === q.correctIndex, correctIndex: q.correctIndex, explanation: q.explanation };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;
  await QuizAttempt.updateOne({ _id: attempt._id }, { answers: answers.map((a) => a ?? -1), correctCount, totalQuestions: quiz.questions.length, score, passed });

  let progress = null;
  if (passed) progress = await syncCompletion(req.user._id, quiz.course);
  const course = await Course.findById(quiz.course).select('title instructor');
  await notify([req.user._id], { type: 'quiz', title: passed ? 'Quiz passed' : 'Quiz submitted', body: `${quiz.title}: ${score}%`, link: '/student/quizzes' });
  void course;
  return ok(res, {
    score, passed, correctCount, totalQuestions: quiz.questions.length, passingScore: quiz.passingScore, certificateId: progress?.certificateId || null,
    results: results.map((r) => (quiz.showAnswers ? r : { questionId: r.questionId, selectedIndex: r.selectedIndex, correct: r.correct })),
  });
});

export const myAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ quiz: req.params.quizId, student: req.user._id, status: { $in: ['submitted', 'expired'] } })
    .sort('-createdAt').select('status score passed correctCount totalQuestions submittedAt startedAt').lean();
  return ok(res, attempts);
});
