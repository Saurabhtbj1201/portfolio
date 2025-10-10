import express from 'express';
import {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  uploadOfferLetter,
  uploadCompletionCertificate,
  deleteOfferLetter,
  deleteCompletionCertificate,
  reorderExperiences
} from '../controllers/experienceController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperienceById);

// Protected routes
router.post('/', protect, upload.fields([
  { name: 'companyLogo', maxCount: 1 }
]), createExperience);

router.put('/:id', protect, upload.fields([
  { name: 'companyLogo', maxCount: 1 }
]), updateExperience);

router.delete('/:id', protect, deleteExperience);
router.put('/reorder', protect, reorderExperiences);
router.post('/:id/offer-letter', protect, upload.single('offerLetter'), uploadOfferLetter);
router.delete('/:id/offer-letter', protect, deleteOfferLetter);
router.post('/:id/completion-certificate', protect, upload.single('completionCertificate'), uploadCompletionCertificate);
router.delete('/:id/completion-certificate', protect, deleteCompletionCertificate);

export default router;
