import express from 'express';
import { verifyAdmin } from '../middleware/adminAuth.js';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,
  getAllPosts,
  hidePost,
  unhidePost,
  deletePost,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin authentication
router.use(verifyAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

// Post Management
router.get('/posts', getAllPosts);
router.put('/posts/:id/hide', hidePost);
router.put('/posts/:id/unhide', unhidePost);
router.delete('/posts/:id', deletePost);

// Category Management
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// University Management
router.get('/universities', getAllUniversities);
router.post('/universities', createUniversity);
router.put('/universities/:id', updateUniversity);
router.delete('/universities/:id', deleteUniversity);

export default router;
