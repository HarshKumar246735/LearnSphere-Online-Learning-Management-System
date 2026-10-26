import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Enrollment from '../models/Enrollment.js';
import CourseReview from '../models/CourseReview.js';
import DiscussionMessage from '../models/DiscussionMessage.js';
import Report from '../models/Report.js';
import Testimonial from '../models/Testimonial.js';
import Certificate from '../models/Certificate.js';
import { getSettings } from '../models/Setting.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import slugify from '../utils/slugify.js';
import { ok, paginationMeta } from '../utils/response.js';
import { refreshRating } from '../services/courseService.js';
import { notify } from '../services/notificationService.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const dashboard = asyncHandler(async (_req, res) => {
  const [users, courses, enrollments, reviews, openReports, certificates, recentUsers] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
    Course.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Enrollment.countDocuments(), CourseReview.countDocuments(), Report.countDocuments({ status: 'open' }), Certificate.countDocuments(),
    User.find().sort('-createdAt').limit(6).select('name email role createdAt').lean(),
  ]);
  const count = (rows, key) => rows.find((r) => r._id === key)?.n || 0;
  return ok(res, {
    users: { students: count(users, 'student'), instructors: count(users, 'instructor'), admins: count(users, 'admin') },
    courses: { published: count(courses, 'published'), draft: count(courses, 'draft'), suspended: count(courses, 'suspended') },
    enrollments, reviews, openReports, certificates, recentUsers,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query;
  const filter = { ...(role ? { role } : {}), ...(search ? { $or: [{ name: new RegExp(escapeRegex(search), 'i') }, { email: new RegExp(escapeRegex(search), 'i') }] } : {}) };
  const [items, total] = await Promise.all([User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter)]);
  return ok(res, items.map(({ password, passwordResetTokenHash, passwordResetExpires, ...u }) => u), 200, paginationMeta(page, limit, total));
});

async function targetUser(req) {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (String(user._id) === String(req.user._id)) throw new AppError('You cannot change your own role or status.', 400); // prevents locking yourself out
  return user;
}

export const setRole = asyncHandler(async (req, res) => {
  const user = await targetUser(req);
  user.role = req.body.role;
  await user.save();
  await notify([user._id], { type: 'system', title: 'Your account role changed', body: `You are now ${user.role === 'admin' ? 'an' : 'a'} ${user.role}.`, link: `/${user.role}/dashboard` });
  return ok(res, { user });
});

export const setActive = asyncHandler(async (req, res) => {
  const user = await targetUser(req);
  user.isActive = req.body.isActive;
  await user.save();
  return ok(res, { user });
});

export const listAllCourses = asyncHandler(async (req, res) => {
  const { page, limit, search, status } = req.query;
  const filter = { ...(status ? { status } : {}), ...(search ? { title: new RegExp(escapeRegex(search), 'i') } : {}) };
  const [items, total] = await Promise.all([
    Course.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('instructor', 'name').populate('category', 'name').lean(),
    Course.countDocuments(filter),
  ]);
  return ok(res, items, 200, paginationMeta(page, limit, total));
});

export const setCourseStatus = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found.', 404);
  if (req.body.status === 'published' && course.lessonsCount < 1) throw new AppError('A course needs at least one lesson to be published.', 400);
  course.status = req.body.status;
  if (course.status === 'published') course.publishedAt ||= new Date();
  await course.save();
  if (course.status === 'suspended') await notify([course.instructor], { type: 'course_update', title: 'Course suspended', body: `${course.title} was suspended by an administrator.`, link: '/instructor/courses' });
  return ok(res, { course });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, slug: slugify(req.body.name) });
  return ok(res, { category }, 201);
});
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found.', 404);
  Object.assign(category, req.body, { slug: slugify(req.body.name) });
  await category.save();
  return ok(res, { category });
});
export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Course.exists({ category: req.params.id })) throw new AppError('Move or delete the courses in this category first.', 409);
  const r = await Category.deleteOne({ _id: req.params.id });
  if (!r.deletedCount) throw new AppError('Category not found.', 404);
  return ok(res, { deleted: true });
});

export const listAllReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const [items, total] = await Promise.all([
    CourseReview.find().sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('student', 'name').populate('course', 'title').lean(),
    CourseReview.countDocuments(),
  ]);
  return ok(res, items, 200, paginationMeta(page, limit, total));
});
export const moderateReview = asyncHandler(async (req, res) => {
  const review = await CourseReview.findByIdAndUpdate(req.params.id, { isHidden: req.body.isHidden }, { new: true });
  if (!review) throw new AppError('Review not found.', 404);
  await refreshRating(review.course);
  return ok(res, { review });
});

export const listReports = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Report.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('reporter', 'name').lean(),
    Report.countDocuments(filter),
  ]);
  // Attach a short preview of the reported content so moderators can judge it without leaving the page.
  const withPreview = await Promise.all(items.map(async (r) => {
    let preview = '';
    if (r.targetType === 'review') preview = (await CourseReview.findById(r.targetId).select('comment rating').lean())?.comment || '(review no longer exists)';
    if (r.targetType === 'discussion') preview = (await DiscussionMessage.findById(r.targetId).select('text').lean())?.text || '(message no longer exists)';
    if (r.targetType === 'course') preview = (await Course.findById(r.targetId).select('title').lean())?.title || '(course no longer exists)';
    return { ...r, preview };
  }));
  return ok(res, withPreview, 200, paginationMeta(page, limit, total));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new AppError('Report not found.', 404);
  if (req.body.hideTarget) {
    if (report.targetType === 'review') {
      const review = await CourseReview.findByIdAndUpdate(report.targetId, { isHidden: true });
      if (review) await refreshRating(review.course);
    } else if (report.targetType === 'discussion') await DiscussionMessage.findByIdAndUpdate(report.targetId, { isHidden: true });
    else if (report.targetType === 'course') await Course.findByIdAndUpdate(report.targetId, { status: 'suspended' });
  }
  Object.assign(report, { status: req.body.status, resolvedBy: req.user._id, resolvedAt: new Date() });
  await report.save();
  return ok(res, { report });
});

export const getAdminSettings = asyncHandler(async (_req, res) => ok(res, { settings: await getSettings() }));
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  Object.assign(settings, req.body);
  await settings.save();
  return ok(res, { settings });
});
export const publicSettings = asyncHandler(async (_req, res) => {
  const s = await getSettings();
  return ok(res, { allowRegistrations: s.allowRegistrations, announcement: s.announcement });
});

export const listTestimonialsAdmin = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find().sort('-createdAt').limit(100).populate('user', 'name role').lean();
  return ok(res, items);
});
export const approveTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true });
  if (!t) throw new AppError('Testimonial not found.', 404);
  return ok(res, { testimonial: t });
});
export const deleteTestimonial = asyncHandler(async (req, res) => {
  await Testimonial.deleteOne({ _id: req.params.id });
  return ok(res, { deleted: true });
});
