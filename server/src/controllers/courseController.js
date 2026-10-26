import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import CourseReview from '../models/CourseReview.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok, paginationMeta } from '../utils/response.js';

const CARD_FIELDS =
  'title slug shortDescription thumbnail level price lessonsCount durationMinutes ratingAvg ratingCount enrollmentCount instructor category isFeatured';

const SORTS = {
  newest: { createdAt: -1 },
  popular: { enrollmentCount: -1, createdAt: -1 },
  rating: { ratingAvg: -1, ratingCount: -1 },
  'price-asc': { price: 1, title: 1 },
  'price-desc': { price: -1, title: 1 },
  title: { title: 1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cardQuery = (filter) =>
  Course.find(filter)
    .select(CARD_FIELDS)
    .populate('instructor', 'name avatar')
    .populate('category', 'name slug');

export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, search, category, level, free, sort } = req.query;
  const filter = { status: 'published' };

  if (category) {
    const cat = await Category.findOne({ slug: category }).select('_id').lean();
    if (!cat) return ok(res, [], 200, paginationMeta(page, limit, 0));
    filter.category = cat._id;
  }
  if (level) filter.level = level;
  if (free) filter.price = 0;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i'); // escaped, so user input can never inject a pattern
    const instructorIds = await User.find({ role: { $in: ['instructor', 'admin'] }, name: rx }).distinct('_id');
    filter.$or = [{ title: rx }, { shortDescription: rx }, { description: rx }, { instructor: { $in: instructorIds } }];
  }

  const [courses, total] = await Promise.all([
    cardQuery(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);
  return ok(res, courses, 200, paginationMeta(page, limit, total));
});

export const featuredCourses = asyncHandler(async (_req, res) => {
  const courses = await cardQuery({ status: 'published' })
    .sort({ isFeatured: -1, enrollmentCount: -1, createdAt: -1 })
    .limit(6)
    .lean();
  return ok(res, courses);
});

export const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: 'published' })
    .populate('instructor', 'name avatar headline bio')
    .populate('category', 'name slug')
    .lean();
  if (!course) throw new AppError('Course not found.', 404);

  const [sections, lessons, reviews] = await Promise.all([
    Section.find({ course: course._id }).sort('order').lean(),
    Lesson.find({ course: course._id }).sort('order').lean(),
    CourseReview.find({ course: course._id, isHidden: false })
      .sort('-createdAt').limit(5).populate('student', 'name avatar').lean(),
  ]);

  // Public visitors only get video ids for lessons the instructor marked as free previews.
  const bySection = new Map();
  for (const l of lessons) {
    const publicLesson = {
      _id: l._id, title: l.title, order: l.order, durationMinutes: l.durationMinutes, isPreview: l.isPreview,
      ...(l.isPreview ? { youtubeVideoId: l.youtubeVideoId, isShort: l.isShort, description: l.description } : {}),
    };
    const key = String(l.section);
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(publicLesson);
  }

  return ok(res, {
    ...course,
    sections: sections.map((s) => ({ _id: s._id, title: s.title, order: s.order, lessons: bySection.get(String(s._id)) || [] })),
    reviews: reviews.map((r) => ({ _id: r._id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, student: r.student })),
  });
});

export const isValidObjectId = (id) => mongoose.isValidObjectId(id);
