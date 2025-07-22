import mongoose from 'mongoose';

const communityGoalSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add community goal title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
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
      enum: ['Charity', 'Environment', 'Education', 'Healthcare', 'Community', 'Other'],
      default: 'Other',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    contributors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      amount: {
        type: Number,
        default: 0,
      },
      contributedAt: {
        type: Date,
        default: Date.now,
      },
    }],
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommunityGoal = mongoose.model('CommunityGoal', communityGoalSchema);

export default CommunityGoal;