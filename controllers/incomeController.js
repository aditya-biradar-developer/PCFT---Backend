import Income from '../models/incomeModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

// @desc    Get all incomes for user
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, amount, category, description, date } = req.body;

    const income = await Income.create({
      user: req.user.id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
    });

    // Update user balance
    const user = await User.findById(req.user.id);
    user.balance += parseFloat(amount);
    await user.save();

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const oldAmount = income.amount;
    const { title, amount, category, description, date } = req.body;

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, description, date },
      { new: true }
    );

    // Update user balance (remove old amount, add new amount)
    const user = await User.findById(req.user.id);
    user.balance = user.balance - oldAmount + parseFloat(amount);
    await user.save();

    res.json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update user balance (remove income amount)
    const user = await User.findById(req.user.id);
    user.balance -= income.amount;
    await user.save();

    await Income.findByIdAndDelete(req.params.id);

    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getIncomes, addIncome, updateIncome, deleteIncome };