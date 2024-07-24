// routes/analytics.js
import { Router } from 'express'
import { mustAuth } from '../middleware/auth';
import { deleteUserAnalytics, getAnalyticsData, getDailyStats, getMonthlyStats, updateUserAnalytics } from '../controllers/userAnalytic';
const router = Router();

// Get daily user analytics
router.get('/daily', mustAuth, getDailyStats);

// Get monthly user analytics
router.get('/monthly', mustAuth, getMonthlyStats);

// Get analytic data for days comparison
router.get('/data', mustAuth, getAnalyticsData);

// Add new user analytics

// Update existing user analytics
router.patch('/:userId', updateUserAnalytics);

// Delete user analytics
router.delete('/delete/:id', deleteUserAnalytics);

export default router;
