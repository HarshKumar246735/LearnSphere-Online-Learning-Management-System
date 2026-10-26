import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test', // automated tests make many requests from one address
    message: { success: false, message },
  });

export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests. Please slow down.');
export const authLimiter = make(15 * 60 * 1000, 20, 'Too many attempts. Try again in 15 minutes.');
export const passwordResetLimiter = make(60 * 60 * 1000, 5, 'Too many reset requests. Try again later.');
export const contactLimiter = make(60 * 60 * 1000, 5, 'Too many messages sent. Please try again later.');
export const publicLimiter = make(60 * 1000, 60, 'Too many requests. Please slow down.');
