import CourseReview from '../models/CourseReview.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok, paginationMeta } from '../utils/response.js';
import { refreshRating } from '../services/courseService.js';
import { notify } from '../services/notificationService.js';

export const listReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = { course: req.params.courseId, isHidden: false };
  const [items, total] = await Promise.all([
    CourseReview.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('student', 'name avatar').lean(),
    CourseReview.countDocuments(filter),
  ]);
  return ok(res, items, 200, paginationMeta(page, limit, total));
});

export const myReview = asyncHandler(async (req, res) => {
  const review = await CourseReview.findOne({ course: req.params.courseId, student: req.user._id }).lean();
  const enrolled = Boolean(await Enrollment.exists({ student: req.user._id, course: req.params.courseId }));
  return ok(res, { review, canReview: enrolled && req.user.role === 'student' });
});

export const createReview = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, status: 'published' });
  if (!course) throw new AppError('Course not found.', 404);
  if (req.user.role !== 'student' || !(await Enrollment.exists({ student: req.user._id, course: course._id }))) {
    throw new AppError('Only students enrolled in this course can review it.', 403);
  }
  try {
    const review = await CourseReview.create({ course: course._id, student: req.user._id, rating: req.body.rating, comment: req.body.comment });
    await refreshRating(course._id);
    await notify([course.instructor], { type: 'course_update', title: 'New course review', body: `${req.user.name} rated ${course.title} ${review.rating}/5.`, link: '/instructor/courses' });
    return ok(res, { review }, 201);
  } catch (err) {
    if (err.code === 11000) throw new AppError('You have already reviewed this course. Edit your review instead.', 409);
    throw err;
  }
});

async function ownReview(req) {
  const review = await CourseReview.findById(req.params.reviewId);
  if (!review) throw new AppError('Review not found.', 404);
  if (String(review.student) !== String(req.user._id) && req.user.role !== 'admin') throw new AppError('You can only change your own review.', 403);
  return review;
}

export const updateReview = asyncHandler(async (req, res) => {
  const review = await ownReview(req);
  if (String(review.student) !== String(req.user._id)) throw new AppError('Only the author can edit a review.', 403);
  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();
  await refreshRating(review.course);
  return ok(res, { review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await ownReview(req);
  await review.deleteOne();
  await refreshRating(review.course);
  return ok(res, { deleted: true });
});
