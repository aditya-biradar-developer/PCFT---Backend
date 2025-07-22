import Expense from '../models/expenseModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, amount, category, description, date, isGoalContribution, goalId } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
      isGoalContribution: isGoalContribution || false,
      goalId: goalId || null,
    });

    // Update user balance
    const user = await User.findById(req.user.id);
    user.balance -= parseFloat(amount);
    await user.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const oldAmount = expense.amount;
    const { title, amount, category, description, date } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, description, date },
      { new: true }
    );

    // Update user balance (add back old amount, subtract new amount)
    const user = await User.findById(req.user.id);
    user.balance = user.balance + oldAmount - parseFloat(amount);
    await user.save();

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update user balance (add back expense amount)
    const user = await User.findById(req.user.id);
    user.balance += expense.amount;
    await user.save();

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getExpenses, addExpense, updateExpense, deleteExpense };