import express, { Request, Response } from 'express';
import { registerRequest } from '../@types/request/user';
import { constResponse } from '../utils/constants/commonMessages';
import User, { userDocument } from '../models/user';

const router = express.Router();

// POST /api/users/register
router.post('/register', async (req: registerRequest, res: Response) => {
    const { age, email, name, password, profilePic } = req.body
    if (!name || !password) {
        return res.status(404).json(constResponse.missing)
    }
    const user = await User.findOne({ email })
    if (user) {
        return res.status(422).json(constResponse.duplicated)
    }
    const newUser = new User({
        email,
        name,
        password, profilePic, age, verified: false
    })
    await newUser.save()
    return res.json(constResponse.ok)
});

// POST /api/users/login
router.post('/login', (req: Request, res: Response) => {
    const { age, email, name, password, profilePic } = req.body
    if (!name || !password) {
        return res.status(404).json(constResponse.missing)
    }
    return res.json(constResponse.ok)
});

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
