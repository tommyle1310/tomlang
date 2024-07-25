import { RequestHandler } from "express"
import { JwtPayload, verify } from "jsonwebtoken"
import { JWT_SECRET } from "../utils/env"
import User from "../models/User"
import { isValidObjectId } from "mongoose"
import { constResponse } from "../utils/constants/commonMessages"

export const mustAuth: RequestHandler = async (req, res, next) => {
    const { authorization } = req.headers
    const token = authorization?.split('Bearer ')[1]
    if (!token) return res.status(402).json({ error: 'Unauthorized request!!' })
    const payload = await verify(token, JWT_SECRET) as JwtPayload
    const id = payload.userId
    const user = await User.findOne({ _id: id, tokens: token })
    if (!user) return res.status(402).json({ error: 'Unauthorized request!!' })


    req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        profilePic: user.profilePic?.url,
        followers: user.followers.length,
        followings: user.followings.length
    }

    req.token = token

    next()
}

export const mustVerified: RequestHandler = async (req, res, next) => {
    const { userId } = req.body; // Assuming userId is sent in the request body. Adjust if it's in headers or params.

    if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verified) {
            req.user = { ...req.user, verified: true };
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(500).json({ ...constResponse.notVerified, message: 'You must be verified to access this resource' });
        }
    } catch (error) {
        console.error('Error checking user verification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
