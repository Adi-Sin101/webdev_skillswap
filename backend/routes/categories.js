import express from 'express';
import { getAllCategories, addCategory } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', addCategory);

export default router;
