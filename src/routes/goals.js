import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
router.use(requireAuth);   

// Params :id schema, 
const idSchema = z.object({
  id: z.string().refine(mongoose.Types.ObjectId.isValid, { message: 'Invalid id' })
});

// Body schema
const goalSchema = z.object({
  period: z.enum(['week', 'month']),
  hoursTarget: z.coerce.number().int().min(1),
  startISOWeek: z.coerce.number().int().min(1).max(53).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
}).strict();

// GET /goals
router.get('/', async (req, res, next) => {
  try {
    const rows = await Goal.find({ user: req.user.sub })
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /goals
router.post('/', validate(goalSchema, 'body'), async (req, res, next) => {
  try {
    const g = await Goal.create({ ...req.valid.body, user: req.user.sub });
    res.status(201).json(g);
  } catch (e) { next(e); }
});

// PATCH /goals/:id
router.patch(
  '/:id',
  validate(idSchema, 'params'),
  validate(goalSchema.partial(), 'body'),
  async (req, res, next) => {
    try {
      const g = await Goal.findOneAndUpdate(
        { _id: req.valid.params.id, user: req.user.sub },
        req.valid.body,
        { new: true }
      );
      if (!g) return res.status(404).json({ error: 'Not found' });
      res.json(g);
    } catch (e) { next(e); }
  }
);

// DELETE /goals/:id
router.delete('/:id', validate(idSchema, 'params'), async (req, res, next) => {
  try {
    const r = await Goal.deleteOne({ _id: req.valid.params.id, user: req.user.sub });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
 /*
 Summary:
 هذا الراوتر يوفر CRUD كامل للأهداف (Goals).
 كل العمليات محمية بـ JWT.
 Zod يتحقق من id والـ body قبل الوصول إلى MongoDB.
 النتائج دائماً تخص المستخدم الحالي (req.user.sub).  */