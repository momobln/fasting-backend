export const validate = (schema, which = 'body') => (req, res, next) => {
  const data =
    which === 'body'   ? req.body   :
    which === 'params' ? req.params :
    which === 'query'  ? req.query  :
    which === 'headers'? req.headers: req.body;

  const result = schema.safeParse(data);
  if (result.success) {
    req.valid = req.valid || {};
    req.valid[which] = result.data; // parsed & sanitized
    return next();
  }

  const errors = result.error.errors.map(e => ({
    path: e.path.join('.'),
    message: e.message,
  }));
  return res.status(400).json({ error: 'Invalid request', details: errors });
};
