import Enrollment from '../models/Enrollment.js';
import LessonProgress from '../models/LessonProgress.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import CourseReview from '../models/CourseReview.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok, paginationMeta } from '../utils/response.js';

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// Consecutive days (ending today or yesterday) on which the student completed at least one lesson.
function streakFrom(dates) {
  const days = new Set(dates.map(dayKey));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return streak;
}

export const studentDashboard = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const [enrollments, certificates, progressRows, recent] = await Promise.all([
    Enrollment.find({ student: me }).sort('-updatedAt').populate({ path: 'course', select: 'title slug thumbnail lessonsCount category instructor', populate: [{ path: 'instructor', select: 'name' }, { path: 'category', select: 'name' }] }).lean(),
    Certificate.countDocuments({ student: me }),
    LessonProgress.find({ student: me }).select('completedAt course').lean(),
    LessonProgress.find({ student: me }).sort('-completedAt').limit(8).populate('lesson', 'title').populate('course', 'title slug').lean(),
  ]);
  const live = enrollments.filter((e) => e.course);
  const doneByCourse = new Map();
  progressRows.forEach((p) => doneByCourse.set(String(p.course), (doneByCourse.get(String(p.course)) || 0) + 1));
  const learning = live.map((e) => {
    const done = Math.min(doneByCourse.get(String(e.course._id)) || 0, e.course.lessonsCount);
    return { _id: e._id, status: e.status, course: e.course, completedLessons: done, percent: e.course.lessonsCount ? Math.round((done / e.course.lessonsCount) * 100) : 0 };
  });

  // Recommendations: published courses in categories the student already studies, then popular ones.
  const enrolledIds = live.map((e) => e.course._id);
  const cats = [...new Set(live.map((e) => String(e.course.category?._id || e.course.category)).filter(Boolean))];
  let recommended = await Course.find({ status: 'published', _id: { $nin: enrolledIds }, category: { $in: cats } })
    .sort('-enrollmentCount').limit(4).select('title slug thumbnail level price lessonsCount durationMinutes ratingAvg ratingCount instructor category').populate('instructor', 'name').populate('category', 'name slug').lean();
  if (recommended.length < 4) {
    const extra = await Course.find({ status: 'published', _id: { $nin: [...enrolledIds, ...recommended.map((c) => c._id)] } })
      .sort('-enrollmentCount').limit(4 - recommended.length).select('title slug thumbnail level price lessonsCount durationMinutes ratingAvg ratingCount instructor category').populate('instructor', 'name').populate('category', 'name slug').lean();
    recommended = [...recommended, ...extra];
  }

  return ok(res, {
    totals: { enrolled: live.length, inProgress: live.filter((e) => e.status !== 'completed').length, completed: live.filter((e) => e.status === 'completed').length, certificates },
    streak: streakFrom(progressRows.map((p) => p.completedAt)),
    learning: learning.slice(0, 6),
    recent: recent.filter((r) => r.lesson && r.course).map((r) => ({ _id: r._id, completedAt: r.completedAt, lesson: r.lesson.title, course: r.course })),
    recommended,
  });
});

export const instructorDashboard = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).select('title slug status enrollmentCount ratingAvg ratingCount').lean();
  const ids = courses.map((c) => c._id);
  const [completed, recent, completedByCourse] = await Promise.all([
    Enrollment.countDocuments({ course: { $in: ids }, status: 'completed' }),
    Enrollment.find({ course: { $in: ids } }).sort('-createdAt').limit(8).populate('student', 'name').populate('course', 'title').lean(),
    Enrollment.aggregate([{ $match: { course: { $in: ids }, status: 'completed' } }, { $group: { _id: '$course', n: { $sum: 1 } } }]),
  ]);
  const doneMap = new Map(completedByCourse.map((c) => [String(c._id), c.n]));
  return ok(res, {
    totals: { courses: courses.length, published: courses.filter((c) => c.status === 'published').length, enrollments: courses.reduce((a, c) => a + c.enrollmentCount, 0), completions: completed },
    recent: recent.filter((r) => r.student && r.course).map((r) => ({ _id: r._id, student: r.student.name, course: r.course.title, at: r.createdAt })),
    performance: courses.map((c) => ({ courseId: c._id, title: c.title, slug: c.slug, status: c.status, enrollments: c.enrollmentCount, completions: doneMap.get(String(c._id)) || 0, rating: c.ratingCount ? c.ratingAvg : null })),
  });
});

export const instructorStudents = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const ids = await Course.find({ instructor: req.user._id }).distinct('_id');
  const filter = { course: { $in: ids } };
  const [rows, total] = await Promise.all([
    Enrollment.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('student', 'name email').populate('course', 'title lessonsCount').lean(),
    Enrollment.countDocuments(filter),
  ]);
  const progress = await LessonProgress.aggregate([
    { $match: { course: { $in: rows.map((r) => r.course?._id).filter(Boolean) }, student: { $in: rows.map((r) => r.student?._id).filter(Boolean) } } },
    { $group: { _id: { s: '$student', c: '$course' }, n: { $sum: 1 } } },
  ]);
  const map = new Map(progress.map((p) => [`${p._id.s}:${p._id.c}`, p.n]));
  const items = rows.filter((r) => r.student && r.course).map((r) => {
    const done = Math.min(map.get(`${r.student._id}:${r.course._id}`) || 0, r.course.lessonsCount);
    return { _id: r._id, student: r.student, course: { _id: r.course._id, title: r.course.title }, status: r.status, enrolledAt: r.createdAt,
      completedLessons: done, totalLessons: r.course.lessonsCount, percent: r.course.lessonsCount ? Math.round((done / r.course.lessonsCount) * 100) : 0 };
  });
  return ok(res, items, 200, paginationMeta(page, limit, total));
});

export const instructorAnalytics = asyncHandler(async (req, res) => {
  const ids = await Course.find({ instructor: req.user._id }).distinct('_id');
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - 5, 1);
  since.setUTCHours(0, 0, 0, 0);
  const [byMonth, ratings] = await Promise.all([
    Enrollment.aggregate([{ $match: { course: { $in: ids }, createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, enrollments: { $sum: 1 } } }]),
    CourseReview.aggregate([{ $match: { course: { $in: ids }, isHidden: false } }, { $group: { _id: '$rating', n: { $sum: 1 } } }]),
  ]);
  const months = [];
  const cursor = new Date(since);
  for (let i = 0; i < 6; i += 1) { months.push(cursor.toISOString().slice(0, 7)); cursor.setUTCMonth(cursor.getUTCMonth() + 1); }
  const map = new Map(byMonth.map((m) => [m._id, m.enrollments]));
  const ratingMap = new Map(ratings.map((r) => [r._id, r.n]));
  return ok(res, {
    enrollmentsByMonth: months.map((m) => ({ month: m, enrollments: map.get(m) || 0 })),
    ratingDistribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: ratingMap.get(star) || 0 })),
  });
});
