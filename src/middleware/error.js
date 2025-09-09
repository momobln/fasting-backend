export default function errorHandler(err, _req, res, _next) {
  // Detailed log for server (use logger instead of console in prod)
  console.error(err.stack || err);

  // Decide status
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;

  // Safe message for client
  const message = status < 500 
    ? err.message || 'Bad request'
    : 'Internal server error';

  res.status(status).json({ error: message });
}
