import express, { Request, Response } from 'express';
import { login, register } from '../controllers/auth';

const router = express.Router();

// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);

export default router