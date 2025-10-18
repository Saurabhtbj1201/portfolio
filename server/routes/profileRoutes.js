import express from 'express';
import { 
  getProfile, 
  uploadProfileImage, 
  deleteProfileImage,
  uploadResume,
  deleteResume,
  updateAbout,
  uploadAboutImage,
  deleteAboutImage,
  uploadLogo,
  deleteLogo
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProfile);
router.put('/about', protect, updateAbout);
router.post('/upload-image', protect, upload.single('image'), uploadProfileImage);
router.delete('/image', protect, deleteProfileImage);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.delete('/resume', protect, deleteResume);
router.post('/upload-about-image', protect, upload.single('image'), uploadAboutImage);
router.delete('/about-image', protect, deleteAboutImage);
router.post('/upload-logo', protect, upload.single('logo'), uploadLogo);
router.delete('/logo', protect, deleteLogo);

export default router;
