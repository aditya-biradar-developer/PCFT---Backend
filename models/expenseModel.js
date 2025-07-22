import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add expense title'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add expense amount'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Transport', 'Housing', 'Healthcare', 'Education', 'Entertainment', 'Shopping', 'Bills', 'Goal Contribution', 'Other'],
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
    isGoalContribution: {
      type: Boolean,
      default: false,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;