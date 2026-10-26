import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import env from './config/env.js';
import { corsOptions } from './config/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import apiRouter from './routes/index.js';
import csrfProtection from './middleware/csrf.js';

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct IPs and secure cookies
app.disable('x-powered-by');

app.use(helmet());
app.use(cors(corsOptions));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use('/health', healthRouter);
app.use('/api/v1', apiLimiter, csrfProtection, apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
