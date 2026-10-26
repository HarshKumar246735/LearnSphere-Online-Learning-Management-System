import Category from '../models/Category.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Testimonial from '../models/Testimonial.js';
import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Course.aggregate([{ $match: { status: 'published' } }, { $group: { _id: '$category', n: { $sum: 1 } } }]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));
  return ok(res, categories.map((c) => ({ ...c, courseCount: countMap.get(String(c._id)) || 0 })));
});

// Real counts only. The client hides any statistic that is zero.
export const platformStats = asyncHandler(async (_req, res) => {
  const [courses, students, instructors, completed] = await Promise.all([
    Course.countDocuments({ status: 'published' }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'instructor', isActive: true }),
    Enrollment.countDocuments({ status: 'completed' }),
  ]);
  return ok(res, { courses, students, instructors, completedCourses: completed });
});

export const listTestimonials = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find({ approved: true }).sort('-createdAt').limit(6).populate('user', 'name role avatar').lean();
  return ok(res, items.map((t) => ({ _id: t._id, quote: t.quote, name: t.user?.name, role: t.user?.role, avatar: t.user?.avatar })));
});

export const submitContact = asyncHandler(async (req, res) => {
  await ContactMessage.create(req.body);
  return ok(res, { received: true }, 201);
});
