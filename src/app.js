import express from 'express';
import cors from 'cors';       //cors: control which origins can access API
import helmet from 'helmet';   //helmet: adds secure HTTP headers
import morgan from 'morgan';   //morgan: logs HTTP requests in dev
import rateLimit from 'express-rate-limit'; //express-rate-limit: limits request rate (anti brute-force)

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
//app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use(errorHandler);

export default app;
/*

هذا الملف هو الهيكل الأساسي لتطبيقك.

يجهّز كل middlewares (CORS, helmet, morgan, JSON parsing).

يحدد حماية خاصة لمسارات /auth.

يربط جميع الـ routes.

يضيف معالجة الأخطاء في النهاية.*/
/* Client → HTTP Request
  ├─ app.use(express.json())      ← تفكيك JSON
  ├─ app.use(cors(...))           ← السماح للأصول
  ├─ app.use(helmet())            ← رؤوس أمان
  ├─ app.use(morgan('dev'))       ← لوج الطلبات
  ├─ app.use('/auth', rateLimit)  ← تحديد معدل لمسارات auth
  ├─ GET /health → { ok: true }
  ├─ /auth   → authRoutes
  ├─ /fasts  → fastsRoutes
  ├─ /goals  → goalsRoutes
  ├─ /stats  → statsRoutes
  └─ app.use(errorHandler)        ← التقاط وإرجاع الأخطاء
*/