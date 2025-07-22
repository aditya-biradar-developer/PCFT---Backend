import express from 'express';
import { body } from 'express-validator';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getExpenses)
  .post(protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
  ], addExpense);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

export default router;