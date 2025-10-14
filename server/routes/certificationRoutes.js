import express from 'express';
import {
  getCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
  togglePinned,
  reorderCertifications
} from '../controllers/certificationController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getCertifications);
router.get('/:id', getCertificationById);

// Protected routes
router.post('/', protect, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), createCertification);

router.put('/:id', protect, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), updateCertification);

router.delete('/:id', protect, deleteCertification);
router.put('/:id/toggle-pinned', protect, togglePinned);
router.put('/reorder', protect, reorderCertifications);

export default router;
