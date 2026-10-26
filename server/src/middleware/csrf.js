import AppError from '../utils/AppError.js';
import { allowedOrigin } from '../config/cors.js';

// CSRF defence for cookie auth across origins (see README). State-changing requests must
//  1. come from the configured frontend origin (when the browser sends an Origin header), and
//  2. carry a custom header, which browsers will not attach to a cross-site form or image request.
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export default function csrfProtection(req, _res, next) {
  if (SAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (origin && origin !== allowedOrigin) return next(new AppError('Request origin not allowed.', 403));
  if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(new AppError('Missing required request header.', 403));
  return next();
}
