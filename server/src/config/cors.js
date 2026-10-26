import env from './env.js';

// Exact-origin allowlist (no wildcards) because cookies are sent cross-origin.
export const allowedOrigin = env.CLIENT_URL.replace(/\/$/, '');

export const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
};
