import User from '../models/User.js';
import Testimonial from '../models/Testimonial.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';

export const getMe = (req, res) => ok(res, { user: req.user });

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'headline', 'bio', 'avatar']; // explicit allow-list: no role, email or isActive
  allowed.forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save();
  return ok(res, { user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new AppError('Your current password is incorrect.', 400);
  user.password = req.body.newPassword;
  await user.save();
  return ok(res, { message: 'Password changed.' });
});

export const submitTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findOneAndUpdate({ user: req.user._id }, { quote: req.body.quote, approved: false }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return ok(res, { testimonial: t, message: 'Thank you. Your testimonial will appear once it has been reviewed.' }, 201);
});
