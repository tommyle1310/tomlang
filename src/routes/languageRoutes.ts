import express, { Request, Response } from 'express';
import { addLanguage, getAllLanguages, updateLanguage } from '../controllers/language';

const router = express.Router();

// POST /api/users/register
router.get('/', getAllLanguages);

// POST /api/users/login
router.post('/', addLanguage);


router.patch('/:languageId', updateLanguage);

export default router