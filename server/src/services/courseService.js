import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import CourseReview from '../models/CourseReview.js';
import Enrollment from '../models/Enrollment.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import slugify from '../utils/slugify.js';

export async function refreshCourseCounters(courseId) {
  const [agg] = await Lesson.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(String(courseId)) } },
    { $group: { _id: null, n: { $sum: 1 }, minutes: { $sum: '$durationMinutes' } } },
  ]);
  await Course.updateOne({ _id: courseId }, { lessonsCount: agg?.n || 0, durationMinutes: agg?.minutes || 0 });
}

export async function refreshRating(courseId) {
  const [agg] = await CourseReview.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(String(courseId)), isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Course.updateOne({ _id: courseId }, { ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg?.n || 0 });
}

export async function uniqueSlug(title) {
  const base = slugify(title) || 'course';
  let slug = base;
  while (await Course.exists({ slug })) slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  return slug;
}

export const isOwnerOrAdmin = (user, course) =>
  user.role === 'admin' || String(course.instructor?._id || course.instructor) === String(user._id);

// Ownership gate used by every instructor operation. Admins may manage any course.
export async function loadOwnedCourse(courseId, user) {
  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found.', 404);
  if (!isOwnerOrAdmin(user, course)) throw new AppError('You can only manage your own courses.', 403);
  return course;
}

// Who may open lesson content: enrolled students, the course owner, or an admin.
export async function hasCourseAccess(user, course) {
  if (isOwnerOrAdmin(user, course)) return true;
  return Boolean(await Enrollment.exists({ student: user._id, course: course._id }));
}
