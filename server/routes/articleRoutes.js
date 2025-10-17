import express from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleStatus,
  reorderArticles
} from '../controllers/articleController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Protected routes
router.post('/', protect, upload.single('thumbnail'), createArticle);
router.put('/:id', protect, upload.single('thumbnail'), updateArticle);
router.delete('/:id', protect, deleteArticle);
router.put('/:id/toggle-status', protect, toggleStatus);
router.put('/reorder', protect, reorderArticles);

export default router;
