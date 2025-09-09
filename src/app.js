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

app.use(cors({
  origin: [/^http:\/\/localhost:5173$/, /^http:\/\/localhost:5174$/],
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/fasts', fastsRoutes);
app.use('/goals', goalsRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

export default app;
