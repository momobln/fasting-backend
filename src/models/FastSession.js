import mongoose from 'mongoose';

const FastSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      index: true, 
      required: true 
    },
    preset: { 
      type: Number, 
      enum: [8, 12, 21], 
      required: true 
    },
    startAt: { 
      type: Date, 
      default: () => new Date(), 
      index: true 
    },
    endAt: { 
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= this.startAt;
        },
        message: 'endAt cannot be before startAt'
      }
    },
    durationMins: { 
      type: Number,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'durationMins must be an integer'
      }
    },
    note: { 
      type: String, 
      maxlength: 280,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('FastSession', FastSchema);
