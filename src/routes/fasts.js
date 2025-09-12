import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Fast from '../models/FastSession.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
router.use(requireAuth);

// utility schema for ObjectId params
const idSchema = z.object({
  id: z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: 'Invalid id'
  })
});

// GET /fasts → latest 100 or paginate
router.get('/', async (req, res) => {
  const rows = await Fast.find({ user: req.user.sub })
    .sort({ startAt: -1 })
    .limit(100)
    .lean();
  res.json(rows);
});
// GET /fasts/:id with populate
router.get('/:id', validate(idSchema, 'params'), async (req, res) => {
  const s = await Fast.findOne({ _id: req.valid.params.id, user: req.user.sub })
    .populate('user', 'email')
    .lean();
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});
// POST /fasts/start
const startSchema = z.object({
  preset: z.coerce.number().int().refine(v => [8,12,21].includes(v)),
  startAt: z.string().datetime().optional()
});
router.post('/start', validate(startSchema, 'body'), async (req, res) => {
  const { preset, startAt } = req.valid.body;
  const s = await Fast.create({
    user: req.user.sub,
    preset,
    startAt: startAt ? new Date(startAt) : new Date()
  });
  res.status(201).json(s);
});

// PATCH /fasts/:id/stop
router.patch('/:id/stop', validate(idSchema, 'params'), async (req, res) => {
  const s = await Fast.findOne({ _id: req.valid.params.id, user: req.user.sub });
  if (!s) return res.status(404).json({ error: 'Not found' });
  if (s.endAt) return res.status(400).json({ error: 'Already stopped' });

  s.endAt = new Date();
  s.durationMins = Math.max(0, Math.round((s.endAt - s.startAt) / 60000));
  await s.save();
  res.json(s);
});

// PATCH /fasts/:id (edit)
const editSchema = z.object({
  note: z.string().max(280).optional(),
  preset: z.coerce.number().int().refine(v => [8,12,21].includes(v)).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional()
});
router.patch('/:id', validate(idSchema, 'params'), validate(editSchema, 'body'), async (req, res) => {
  const s = await Fast.findOne({ _id: req.valid.params.id, user: req.user.sub });
  if (!s) return res.status(404).json({ error: 'Not found' });

  const { note, preset, startAt, endAt } = req.valid.body;
  if (note !== undefined) s.note = note;
  if (preset !== undefined) s.preset = preset;
  if (startAt !== undefined) s.startAt = new Date(startAt);
  if (endAt !== undefined) s.endAt = new Date(endAt);

  if (s.endAt) {
    s.durationMins = Math.max(0, Math.round((s.endAt - s.startAt) / 60000));
  }

  await s.save();
  res.json(s);
});

// DELETE /fasts/:id
router.delete('/:id', validate(idSchema, 'params'), async (req, res) => {
  const r = await Fast.deleteOne({ _id: req.valid.params.id, user: req.user.sub });
  if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

export default router;
