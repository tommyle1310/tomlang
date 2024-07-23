import express, { Request, Response } from 'express';
import { getUserProfile, updateAvatar } from '../controllers/user';
import fileParser from '../middleware/fileParser';

const router = express.Router();

// GET /api/users/profile/:userId
router.get('/profile/:userId', getUserProfile);

// PUT /api/users/profile/:userId
router.patch('/profile/avatar/:userId', fileParser, updateAvatar);

// DELETE /api/users/:userId
router.delete('/:userId', (req: Request, res: Response) => {
    // Implementation for deleting user account
});

export default router;
