import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import CourseReview from '../models/CourseReview.js';
import DiscussionMessage from '../models/DiscussionMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { loadOwnedCourse, uniqueSlug } from '../services/courseService.js';

const EDITABLE = ['title', 'slug', 'shortDescription', 'description', 'thumbnail', 'category', 'level', 'learningObjectives', 'prerequisites', 'price', 'language'];

async function assertCategory(id) {
  if (id && !(await Category.exists({ _id: id }))) throw new AppError('That category does not exist.', 400);
}

export const createCourse = asyncHandler(async (req, res) => {
  await assertCategory(req.body.category);
  const data = Object.fromEntries(EDITABLE.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]]));
  data.slug = data.slug || (await uniqueSlug(data.title));
  // Ownership and status come from the session, never from the request body.
  const course = await Course.create({ ...data, instructor: req.user._id, status: 'draft' });
  return ok(res, { course }, 201);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.id, req.user);
  await assertCategory(req.body.category);
  EDITABLE.forEach((k) => { if (req.body[k] !== undefined) course[k] = req.body[k]; });
  await course.save();
  return ok(res, { course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.id, req.user);
  if (course.enrollmentCount > 0) throw new AppError('This course has enrolled students. Unpublish it instead of deleting it.', 409);
  const lessonIds = await Lesson.find({ course: course._id }).distinct('_id');
  await Promise.all([
    Section.deleteMany({ course: course._id }), Lesson.deleteMany({ course: course._id }),
    LessonProgress.deleteMany({ lesson: { $in: lessonIds } }), Quiz.deleteMany({ course: course._id }),
    QuizAttempt.deleteMany({ course: course._id }), CourseReview.deleteMany({ course: course._id }),
    DiscussionMessage.deleteMany({ course: course._id }),
  ]);
  await course.deleteOne();
  return ok(res, { deleted: true });
});

export const setPublished = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.id, req.user);
  if (req.body.published) {
    if (course.status === 'suspended' && req.user.role !== 'admin') throw new AppError('This course was suspended by an administrator.', 403);
    if (course.lessonsCount < 1) throw new AppError('Add at least one lesson before publishing.', 400);
    course.status = 'published';
    course.publishedAt ||= new Date();
  } else {
    course.status = 'draft';
  }
  await course.save();
  return ok(res, { course });
});

// The instructor's own courses, all statuses.
export const myCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-updatedAt').populate('category', 'name slug').lean();
  return ok(res, courses);
});

// Full editable view (includes drafts and every lesson field) for the owner or an admin.
export const getManagedCourse = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.id, req.user);
  const [sections, lessons] = await Promise.all([
    Section.find({ course: course._id }).sort('order').lean(),
    Lesson.find({ course: course._id }).sort('order').lean(),
  ]);
  const bySection = {};
  lessons.forEach((l) => { (bySection[l.section] ||= []).push(l); });
  return ok(res, { course, sections: sections.map((s) => ({ ...s, lessons: bySection[s._id] || [] })) });
});
