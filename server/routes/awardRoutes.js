import express from 'express';
import {
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
  getAssociations,
  toggleFeatured
} from '../controllers/awardController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAwards);

// Protected routes - place specific routes before parameterized routes
router.get('/data/associations', protect, getAssociations);
router.put('/:id/toggle-featured', protect, toggleFeatured);

// Parameterized routes should come after specific routes
router.get('/:id', getAwardById);

router.post('/', protect, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), createAward);

router.put('/:id', protect, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), updateAward);

router.delete('/:id', protect, deleteAward);

export default router;
