import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Fast from './models/FastSession.js';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fasting-tracker';
  await mongoose.connect(uri);
  console.log('Connected');

  const email = 'demo@example.com';
  const passwordHash = await bcrypt.hash('DemoPass123!', 12); //Hash password "DemoPass123!" with 12 salt rounds.
  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true }
  );
//Define time markers: now, yesterday, two days ago.
  const now = new Date();   
  const yesterday = new Date(now.getTime() - 24*60*60*1000);
  const twoDays = new Date(now.getTime() - 2*24*60*60*1000);

  await Fast.deleteMany({ user: user._id });

  await Fast.create([
    { user: user._id, preset: 12, startAt: twoDays, endAt: new Date(twoDays.getTime()+12*60*60*1000), durationMins: 12*60, note: 'seed 1' },
    { user: user._id, preset: 8,  startAt: yesterday, endAt: new Date(yesterday.getTime()+8*60*60*1000),  durationMins: 8*60,  note: 'seed 2' },
  ]);

  console.log('Seeded user:', email, 'password: DemoPass123!');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
/* npm run seed
  └─ src/seed.js
       ├─ تحميل .env
       ├─ connect(MONGODB_URI)
       ├─ upsert مستخدم demo
       ├─ حذف جلسات قديمة للمستخدم
       ├─ إنشاء جلستين صيام تجريبية
       └─ disconnect()
*/