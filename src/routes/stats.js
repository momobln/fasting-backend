import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import Fast from '../models/FastSession.js';

const router = express.Router();
router.use(requireAuth);

// helper: shift Date by tz offset (minutes) to get local-day keys
const toLocalDayKey = (d, tzOffsetMinutes) => {
  const ms = d.getTime() + tzOffsetMinutes * 60_000;
  const local = new Date(ms);
  local.setHours(0, 0, 0, 0);
  return local.getTime(); // numeric key for the local midnight
};

const querySchema = z.object({
  tzOffsetMinutes: z.coerce.number().int().min(-12 * 60).max(14 * 60).default(0) // client’s UTC offset
}).strict();

/**
 * GET /stats/weekly?tzOffsetMinutes=+/-minutes
 * last 7 local days including today
 */
router.get('/weekly', async (req, res, next) => {
  try {
    const { tzOffsetMinutes } = querySchema.parse(req.query);

    const now = new Date();
    // compute local start of today then back 6 days
    const todayKey = toLocalDayKey(now, tzOffsetMinutes);
    const startKey = todayKey - 6 * 24 * 60 * 60 * 1000;
    const start = new Date(startKey - tzOffsetMinutes * 60_000); // convert back to UTC wall clock

    // fetch relevant rows
    const rows = await Fast.find({
      user: req.user.sub,
      startAt: { $gte: start }
    }).select('startAt endAt durationMins').lean();

    // accumulate minutes per day and total
    let totalMins = 0;
    const dayHasStart = new Set();
    for (const r of rows) {
      const end = r.endAt || now;
      const mins = Number.isFinite(r.durationMins)
        ? r.durationMins
        : Math.max(0, Math.round((end - r.startAt) / 60000));
      totalMins += mins;

      const key = toLocalDayKey(new Date(r.startAt), tzOffsetMinutes);
      dayHasStart.add(key);
    }

    const totalHours = +(totalMins / 60).toFixed(1);
    const avgHours = +(totalHours / 7).toFixed(1);

    // streak over last days using local keys
    let streak = 0;
    for (let i = 0; i < 365; i++) { // hard cap
      const key = todayKey - i * 24 * 60 * 60 * 1000;
      if (dayHasStart.has(key)) streak++;
      else break;
    }

    res.json({ totalHours, avgHours, streak });
  } catch (e) {
    next(e);
  }
});

export default router;