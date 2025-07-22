import CommunityGoal from '../models/communityModel.js';
import Expense from '../models/expenseModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

// @desc    Get all community goals
// @route   GET /api/community
// @access  Private
const getCommunityGoals = async (req, res) => {
  try {
    const communityGoals = await CommunityGoal.find({ isActive: true })
      .populate('createdBy', 'name')
      .populate('contributors.user', 'name')
      .sort({ createdAt: -1 });
    res.json(communityGoals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new community goal
// @route   POST /api/community
// @access  Private
const createCommunityGoal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, targetAmount, category, targetDate } = req.body;

    const communityGoal = await CommunityGoal.create({
      title,
      description,
      targetAmount,
      category,
      targetDate,
      createdBy: req.user.id,
    });

    const populatedGoal = await CommunityGoal.findById(communityGoal._id)
      .populate('createdBy', 'name');

    res.status(201).json(populatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Contribute to community goal
// @route   POST /api/community/:id/contribute
// @access  Private
const contributeToCommunityGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const communityGoal = await CommunityGoal.findById(req.params.id);

    if (!communityGoal) {
      return res.status(404).json({ message: 'Community goal not found' });
    }

    if (!communityGoal.isActive) {
      return res.status(400).json({ message: 'Community goal is not active' });
    }

    const user = await User.findById(req.user.id);
    
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update community goal current amount
    communityGoal.currentAmount += parseFloat(amount);
    
    // Add or update contributor
    const existingContributorIndex = communityGoal.contributors.findIndex(
      contributor => contributor.user.toString() === req.user.id
    );

    if (existingContributorIndex > -1) {
      communityGoal.contributors[existingContributorIndex].amount += parseFloat(amount);
      communityGoal.contributors[existingContributorIndex].contributedAt = new Date();
    } else {
      communityGoal.contributors.push({
        user: req.user.id,
        amount: parseFloat(amount),
      });
    }
    
    // Check if goal is completed
    if (communityGoal.currentAmount >= communityGoal.targetAmount) {
      communityGoal.isCompleted = true;
      communityGoal.completedAt = new Date();
    }

    await communityGoal.save();

    // Create expense entry for community goal contribution
    await Expense.create({
      user: req.user.id,
      title: `Contribution to ${communityGoal.title}`,
      amount: parseFloat(amount),
      category: 'Goal Contribution',
      description: `Contribution to community goal: ${communityGoal.title}`,
      isGoalContribution: true,
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

    const updatedGoal = await CommunityGoal.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('contributors.user', 'name');

    res.json({ communityGoal: updatedGoal, message: 'Contribution successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getCommunityGoals, createCommunityGoal, contributeToCommunityGoal };