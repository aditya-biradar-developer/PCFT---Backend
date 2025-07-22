import Goal from '../models/goalModel.js';
import Expense from '../models/expenseModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new goal
// @route   POST /api/goals
// @access  Private
const addGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, targetAmount, category, description, targetDate } = req.body;

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      category,
      description,
      targetDate,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Contribute to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const user = await User.findById(req.user.id);
    
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update goal current amount
    goal.currentAmount += parseFloat(amount);
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();

    // Create expense entry for goal contribution
    await Expense.create({
      user: req.user.id,
      title: `Contribution to ${goal.title}`,
      amount: parseFloat(amount),
      category: 'Goal Contribution',
      description: `Contribution to personal goal: ${goal.title}`,
      isGoalContribution: true,
      goalId: goal._id,
    });

    // Update user balance and savings
    user.balance -= parseFloat(amount);
    user.totalSaved += parseFloat(amount);
    
    // Update saving streak
    const today = new Date();
    const lastSaving = user.lastSavingDate ? new Date(user.lastSavingDate) : null;
    
    if (!lastSaving || (today.toDateString() !== lastSaving.toDateString())) {
      if (lastSaving && (today - lastSaving) <= 24 * 60 * 60 * 1000) {
        user.savingStreak += 1;
      } else if (!lastSaving || (today - lastSaving) > 24 * 60 * 60 * 1000) {
        user.savingStreak = 1;
      }
      user.lastSavingDate = today;
    }
    
    await user.save();

    res.json({ goal, message: 'Contribution successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { title, targetAmount, category, description, targetDate } = req.body;

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { title, targetAmount, category, description, targetDate },
      { new: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getGoals, addGoal, contributeToGoal, updateGoal, deleteGoal };