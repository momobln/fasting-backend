import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import fastsRoutes from './routes/fasts.js';
import goalsRoutes from './routes/goals.js';
import statsRoutes from './routes/stats.js';

import errorHandler from './middleware/error.js';

const app = express();

app.use(express.json());

// CORS: ORIGIN single or comma list via CORS_ORIGINS
const origins = (process.env.CORS_ORIGINS || process.env.ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : undefined,
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));

// Light rate-limit for auth only
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use('/auth', authLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/fasts', fastsRoutes);
app.use('/goals', goalsRoutes);
app.use('/stats', statsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use(errorHandler);

export default app;
