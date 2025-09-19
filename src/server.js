import 'dotenv/config';
import app from './app.js';
import { connectDB } from './lib/db.js';

const PORT = Number(process.env.PORT) || 5005; //Define server port from .env.& Defaults to 5005 if not set.

try {
  await connectDB(process.env.MONGODB_URI);
} catch (err) {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
}

app.set('trust proxy', 1);   //Configure Express to trust proxy (e.g., when deployed behind Vercel).

app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});

/*Summary: 
server.js = نقطة الدخول (entry point) للـ backend.
يحمّل الإعدادات من .env.
يتصل بـ MongoDB.
يشغّل تطبيق Express.
يوقف التشغيل إذا قاعدة البيانات غير متصلة.*/

/*npm start
  └─ node src/server.js
       ├─ تحميل .env  (dotenv)
       ├─ استيراد app (Express) + connectDB
       ├─ تحديد PORT
       ├─ connectDB(MONGODB_URI) ← اتصال MongoDB عبر Mongoose
       ├─ app.set('trust proxy', 1)
       └─ app.listen(PORT)
            └─ "API on :PORT"
*/