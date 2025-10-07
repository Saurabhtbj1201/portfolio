import express from 'express';
import {
  getSkillsWithCategories,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSkill,
  getSkillsByCategory,
  updateSkill,
  deleteSkill,
  reorderSkills,
  reorderCategories
} from '../controllers/skillController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getSkillsWithCategories);
router.get('/category/:categoryId', getSkillsByCategory);

// Protected routes
router.get('/categories', protect, getCategories);
router.post('/categories', protect, createCategory);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);
router.put('/categories/reorder', protect, reorderCategories);

router.post('/', protect, upload.single('image'), createSkill);
router.put('/:id', protect, upload.single('image'), updateSkill);
router.delete('/:id', protect, deleteSkill);
router.put('/reorder', protect, reorderSkills);

export default router;
