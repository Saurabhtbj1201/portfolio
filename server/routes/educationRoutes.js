import express from 'express';
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation
} from '../controllers/educationController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getEducation);

// Protected routes
router.post('/', protect, upload.single('logo'), createEducation);
router.put('/:id', protect, upload.single('logo'), updateEducation);
router.delete('/:id', protect, deleteEducation);
router.put('/reorder', protect, reorderEducation);

export default router;
