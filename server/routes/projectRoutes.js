import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  toggleHomeVisibility
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', protect, upload.single('image'), createProject);
router.put('/:id', protect, upload.single('image'), updateProject);
router.delete('/:id', protect, deleteProject);
router.put('/reorder', protect, reorderProjects);
router.put('/:id/toggle-home', protect, toggleHomeVisibility);

export default router;
