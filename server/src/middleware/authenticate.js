import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

async function userFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  let payload;
  try { payload = verifyToken(token); } catch { return null; }
  const user = await User.findById(payload.sub);
  return user && user.isActive ? user : null;
}

export const authenticate = asyncHandler(async (req, _res, next) => {
  const user = await userFromRequest(req);
  if (!user) throw new AppError('Please log in to continue.', 401);
  req.user = user;
  next();
});

// Attaches req.user when a valid session exists but never rejects (for pages that adapt to the viewer).
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = (await userFromRequest(req)) || undefined;
  next();
});

export const authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new AppError('You do not have permission to do that.', 403));
