import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72) // stricter min length
});

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/signup', validate(credSchema, 'body'), async (req, res, next) => {
  try {
    const { email, password } = req.valid.body; // safe parsed
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    const token = signToken(user);
    res.status(201).json({ token });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
});

router.post('/login', validate(credSchema, 'body'), async (req, res, next) => {
  try {
    const { email, password } = req.valid.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});
// GET /auth/verify
router.get('/verify', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select('email role createdAt').lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user });
  } catch (e) { next(e); }
});

export default router;
/* ربط سريع مع الواجهة الأمامية / Frontend link
بعد signup أو login خزّن token في localStorage.
axios interceptor لديك يرسل Authorization: Bearer <token> تلقائياً.
GET /auth/verify يستخدمه الـ frontend لاسترجاع هوية المستخدم عند الإقلاع. */
