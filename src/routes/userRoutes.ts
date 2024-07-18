import express, { Request, Response } from 'express';
import { login, register } from '../controllers/auth';

const router = express.Router();

// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);



// GET /api/users/profile/:userId
router.get('/profile/:userId', (req: Request, res: Response) => {
    // Implementation for getting user profile
});

// PUT /api/users/profile/:userId
router.put('/profile/:userId', (req: Request, res: Response) => {
    // Implementation for updating user profile
});

// DELETE /api/users/:userId
router.delete('/:userId', (req: Request, res: Response) => {
    // Implementation for deleting user account
});

export default router;
