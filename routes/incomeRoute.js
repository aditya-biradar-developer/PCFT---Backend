import express from 'express';
import { body } from 'express-validator';
import { getIncomes, addIncome, updateIncome, deleteIncome } from '../controllers/incomeController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getIncomes)
  .post(protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
  ], addIncome);

router.route('/:id')
  .put(protect, updateIncome)
  .delete(protect, deleteIncome);

export default router;