import { Request, Response } from "express"
import { constResponse } from "../utils/constants/commonMessages"
import mongoose, { isValidObjectId, ObjectId } from "mongoose"
import User from "../models/User"
import cloudinary from "../cloud";
import { IncomingForm } from 'formidable';
import { RequestWithFiles } from "../middleware/fileParser";
import { getAllCoursesAggregation } from "../utils/aggregation/course";
import { getAllUsersAggregation } from "../utils/aggregation/user";



export const getUserProfile = async (req: Request, res: Response) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid userId' })
    const user = await User.findById(userId)
    if (!user) {
        return res.status(422).json({ ...constResponse.notfound, message: 'Cannot find this course.' })
    }
    return res.json({ ...constResponse.ok, user })
}

export const updateAvatar = async (req: RequestWithFiles, res: Response) => {
    console.log('Received request to update avatar');
    try {
        const { userId } = req.params;

        console.log('UserId:', userId);

        // Check if the user exists
        const existsUser = await User.findById(userId);
        if (!existsUser) {
            console.log('User not found');
            return res.status(422).json({ ...constResponse.notfound, message: 'User not found.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found after update');
            return res.status(404).json({ ...constResponse.notfound, message: 'User not found' });
        }

        const userAvt = req.files?.profilePic && (Array.isArray(req.files.profilePic) ? req.files.profilePic[0] : req.files.profilePic);
        if (userAvt) {
            console.log('Processing new avatar');

            // Delete old profile picture if exists
            if (user.profilePic?.key) {
                try {
                    console.log('Deleting old profile picture from Cloudinary:', user.profilePic.key);
                    await cloudinary.uploader.destroy(user.profilePic.key);
                } catch (err) {
                    console.error('Error deleting profile picture from Cloudinary:', err);
                }
            }

            // Upload new profile picture to Cloudinary
            try {
                const imgRes = await cloudinary.uploader.upload(userAvt.filepath, {
                    width: 300,
                    height: 300,
                    crop: 'thumb',
                    gravity: 'face'
                });

                console.log('Uploaded new profile picture to Cloudinary:', imgRes);
                user.profilePic = { url: imgRes.secure_url, key: imgRes.public_id };
                await user.save();

            } catch (err) {
                console.error('Error uploading new profile picture to Cloudinary:', err);
                return res.status(500).json({ ...constResponse.unknown, message: 'Failed to upload new profile picture.' });
            }
        }

        return res.json({ ...constResponse.ok, user });
    } catch (e) {
        console.error('Unhandled error:', e);
        return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the user profile.' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const courses = await getAllUsersAggregation(page, limit)

        const totalCourses = await User.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);

        return res.json({
            ...constResponse.ok,
            courses,
            totalPages,
            currentPage: page,
            totalCourses
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching courses', error });
    }
};
