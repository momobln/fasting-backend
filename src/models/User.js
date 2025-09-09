// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,  // normalize email
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] // optional extra
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
