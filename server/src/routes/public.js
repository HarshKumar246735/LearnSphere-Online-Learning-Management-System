import { Router } from 'express';
import validate from '../middleware/validate.js';
import { contactBody } from '../validators/contact.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { listCategories, platformStats, listTestimonials, submitContact } from '../controllers/publicController.js';

const router = Router();

router.get('/categories', listCategories);
router.get('/stats', platformStats);
router.get('/testimonials', listTestimonials);
router.post('/contact', contactLimiter, validate({ body: contactBody }), submitContact);

export default router;
