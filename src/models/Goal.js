import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      index: true, 
      required: true 
    },
    period: { 
      type: String, 
      enum: ['week', 'month'], 
      required: true 
    },
    hoursTarget: { 
      type: Number, 
      min: 1, 
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'hoursTarget must be an integer'
      }
    },
    startISOWeek: { 
      type: Number,
      min: 1,
      max: 53 // ISO weeks: 1–53
    },
    year: { 
      type: Number,
      min: 2000, // assumption
      max: 2100  // assumption
    }
  },
  { timestamps: true }
);

// prevent duplicate goals for same user/period/year/week
GoalSchema.index(
  { user: 1, period: 1, year: 1, startISOWeek: 1 },
  { unique: true, partialFilterExpression: { period: 'week' } }
);

export default mongoose.model('Goal', GoalSchema);
