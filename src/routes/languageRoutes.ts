import express, { Request, Response } from 'express';
import { addLanguage, getAllLanguages } from '../controllers/language';

const router = express.Router();

// POST /api/users/register
router.get('/', getAllLanguages);

// POST /api/users/login
router.post('/', addLanguage);

export default router