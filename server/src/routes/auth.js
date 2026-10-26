import { Router } from 'express';
import validate from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { registerBody, loginBody, forgotBody, resetBody } from '../validators/schemas.js';
import { register, login, logout, me, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = Router();
router.post('/register', authLimiter, validate({ body: registerBody }), register);
router.post('/login', authLimiter, validate({ body: loginBody }), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', passwordResetLimiter, validate({ body: forgotBody }), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate({ body: resetBody }), resetPassword);
export default router;
