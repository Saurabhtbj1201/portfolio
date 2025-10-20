import express from 'express';
import {
  getFloatingMessage,
  getAllFloatingMessages,
  createFloatingMessage,
  updateFloatingMessage,
  deleteFloatingMessage,
  toggleActiveStatus
} from '../controllers/floatingMessageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - get active floating message for frontend
router.get('/', getFloatingMessage);

// Admin routes - require authentication
router.get('/admin', protect, getAllFloatingMessages);
router.post('/admin', protect, createFloatingMessage);
router.put('/admin/:id', protect, updateFloatingMessage);
router.delete('/admin/:id', protect, deleteFloatingMessage);
router.patch('/admin/:id/toggle', protect, toggleActiveStatus);

export default router;
