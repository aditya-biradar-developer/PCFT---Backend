import mongoose from 'mongoose';

const incomeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add income title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add income amount'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model('Income', incomeSchema);

export default Income;