import express from 'express';
import { trackEvent, getStats, getDetailedAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/track', trackEvent);
router.get('/stats', getStats);
router.get('/detailed', protect, getDetailedAnalytics);

export default router;
