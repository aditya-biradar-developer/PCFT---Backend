import mongoose from 'mongoose';

const goalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add goal title'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add target amount'],
      min: [1, 'Target amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Emergency Fund', 'Vacation', 'Car', 'House', 'Education', 'Investment', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
    },
    targetDate: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;