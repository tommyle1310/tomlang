import express, { Request, Response } from 'express';
import { addCategory, getAllCategories } from '../controllers/category';

const router = express.Router();

// POST /api/users/register
router.get('/', getAllCategories);

// POST /api/users/login
router.post('/', addCategory);

// router.patch('/:id', editCategory);

export default router