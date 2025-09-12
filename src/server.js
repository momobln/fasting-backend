import 'dotenv/config';
import app from './app.js';
import { connectDB } from './lib/db.js';

const PORT = Number(process.env.PORT) || 5005;

try {
  await connectDB(process.env.MONGODB_URI);
} catch (err) {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
}

app.set('trust proxy', 1);

app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});
