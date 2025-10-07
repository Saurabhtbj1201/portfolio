import express from 'express';
import {
  submitContactForm,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  markMultipleAsRead,
  getContactStats
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitContactForm);

// Protected routes
router.get('/', protect, getContacts);
router.get('/stats', protect, getContactStats);
router.get('/:id', protect, getContactById);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);
router.put('/mark-read', protect, markMultipleAsRead);

export default router;
