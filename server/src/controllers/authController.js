import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { getSettings } from '../models/Setting.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { sendMail } from '../services/mailService.js';

// Used to spend the same time on unknown emails as on real ones, so response timing does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  if (!settings.allowRegistrations) throw new AppError('New registrations are currently closed.', 403);
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new AppError('An account with that email already exists.', 409);
  const user = await User.create({ name, email, password }); // role always defaults to "student"
  setAuthCookie(res, user._id);
  return ok(res, { user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const valid = user ? await user.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH).then(() => false);
  if (!user || !valid) throw new AppError('Incorrect email or password.', 401);
  if (!user.isActive) throw new AppError('This account has been deactivated. Contact support.', 403);
  user.lastSeenAt = new Date();
  await user.save({ validateBeforeSave: false });
  setAuthCookie(res, user._id);
  user.password = undefined;
  return ok(res, { user });
});

export const logout = (_req, res) => {
  clearAuthCookie(res);
  return ok(res, { loggedOut: true });
};

export const me = (req, res) => ok(res, { user: req.user });

const GENERIC = 'If an account exists for that email, a reset link has been sent.';

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email, isActive: true });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = sha256(token); // only the hash is stored
    user.passwordResetExpires = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MIN * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your LearnSphere password',
        text: `Hi ${user.name},\n\nUse this link to choose a new password (valid for ${env.PASSWORD_RESET_EXPIRES_MIN} minutes):\n${env.CLIENT_URL.replace(/\/$/, '')}/reset-password?token=${token}\n\nIf you did not ask for this, you can ignore this email.`,
      });
    } catch (err) {
      console.error('Password reset email failed:', err.message); // never log the token or link
    }
  }
  return ok(res, { message: GENERIC });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ passwordResetTokenHash: sha256(req.body.token), passwordResetExpires: { $gt: new Date() } })
    .select('+passwordResetTokenHash +passwordResetExpires');
  if (!user) throw new AppError('This reset link is invalid or has expired.', 400);
  user.password = req.body.password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  clearAuthCookie(res);
  return ok(res, { message: 'Password updated. Please log in.' });
});
