import express, { Request, Response } from 'express';
import { getUserProfile } from '../controllers/user';

const router = express.Router();

// GET /api/users/profile/:userId
router.get('/profile/:userId', getUserProfile);

// PUT /api/users/profile/:userId
router.put('/profile/:userId', (req: Request, res: Response) => {
    // Implementation for updating user profile
});

// DELETE /api/users/:userId
router.delete('/:userId', (req: Request, res: Response) => {
    // Implementation for deleting user account
});

export default router;
