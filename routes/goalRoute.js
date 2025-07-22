import express from 'express';
import { body } from 'express-validator';
import { getGoals, addGoal, contributeToGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getGoals)
  .post(protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
  ], addGoal);

router.post('/:id/contribute', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Contribution amount must be greater than 0'),
], contributeToGoal);

router.route('/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

export default router;