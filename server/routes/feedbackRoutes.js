import express from 'express';
import {
  getApprovedTestimonials,
  submitFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
  toggleFeedbackApproval
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/testimonials', getApprovedTestimonials);
router.post('/', upload.single('profileImage'), submitFeedback);

// Protected routes
router.get('/admin', protect, getAllFeedback);
router.put('/:id', protect, upload.single('profileImage'), updateFeedback);
router.delete('/:id', protect, deleteFeedback);
router.put('/:id/toggle-approval', protect, toggleFeedbackApproval);

export default router;
