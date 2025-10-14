import express from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
  getContactStats
} from '../controllers/contactMessageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitContactMessage);

// Protected routes
router.get('/admin', protect, getAllContactMessages);
router.get('/stats', protect, getContactStats);
router.put('/:id/read', protect, markMessageAsRead);
router.delete('/:id', protect, deleteContactMessage);

export default router;
