import { ZodError } from 'zod';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import env from '../config/env.js';

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// Centralised error handler. Clients never receive stack traces or internal messages.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.isOperational ? err.message : 'Something went wrong on our side. Please try again.';
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    message = 'Please check the highlighted fields.';
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Some values are invalid.';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid identifier.';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `That ${field} is already in use.`;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  }

  if (status >= 500 && env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
    if (env.NODE_ENV === 'development') console.error(err.stack);
  }

  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}
