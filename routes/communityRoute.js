import express from 'express';
import { body } from 'express-validator';
import { getCommunityGoals, createCommunityGoal, contributeToCommunityGoal } from '../controllers/communityController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getCommunityGoals)
  .post(protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
  ], createCommunityGoal);

router.post('/:id/contribute', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Contribution amount must be greater than 0'),
], contributeToCommunityGoal);

export default router;