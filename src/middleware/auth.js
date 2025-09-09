import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = header.slice(7);
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
