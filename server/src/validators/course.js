import { z } from 'zod';
import { pagination } from './common.js';

export const slugParam = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(160) });

export const listCoursesQuery = pagination.extend({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().toLowerCase().max(80).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  free: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  sort: z.enum(['newest', 'popular', 'rating', 'price-asc', 'price-desc', 'title']).default('newest'),
});
