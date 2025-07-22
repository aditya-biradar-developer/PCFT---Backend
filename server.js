import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import incomeRoutes from './routes/incomeRoute.js';
import expenseRoutes from './routes/expenseRoute.js';
import goalRoutes from './routes/goalRoute.js';
import communityRoutes from './routes/communityRoute.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ CORS middleware (for both local and deployed frontend)
app.use(cors({
  origin: [
    'http://localhost:5173',             // Vite local dev
    'http://localhost:3000',             // Create React App local dev
    'https://pcft-frontend.onrender.com' // Render deployed frontend
  ],
  credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/community', communityRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
