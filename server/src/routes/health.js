import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    status: dbReady ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    database: dbReady ? 'connected' : 'disconnected',
  });
});

export default router;
