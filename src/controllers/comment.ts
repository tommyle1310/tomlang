import { Request, Response } from "express";
import Comment from "../models/Comment";
import { constResponse } from "../utils/constants/commonMessages";
import cloudinary from "../cloud";
import { IncomingForm } from 'formidable';
import { isValidObjectId } from "mongoose";

export const createComment = async (req: Request, res: Response) => {
    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;
            const author = Array.isArray(fields.author) ? fields.author[0] : fields.author;
            const postId = Array.isArray(fields.postId) ? fields.postId[0] : fields.postId;

            if (!content || !author || !postId) {
                return res.status(400).json({ ...constResponse.missing, message: 'Content, author, and postId must be provided' });
            }
            if (!isValidObjectId(author) || !isValidObjectId(postId)) {
                return res.status(400).json({ ...constResponse.invalid, message: 'Invalid authorId or postId' });
            }

            const images = files.images ? (Array.isArray(files.images) ? files.images : [files.images]) : [];
            const videos = files.videos ? (Array.isArray(files.videos) ? files.videos : [files.videos]) : [];

            const imageUploadPromises = images.map(async (image) => {
                const imgRes = await cloudinary.uploader.upload(image.filepath);
                return { url: imgRes.secure_url, key: imgRes.public_id };
            });

            const videoUploadPromises = videos.map(async (video) => {
                const vidRes = await cloudinary.uploader.upload(video.filepath, { resource_type: 'video' });
                return { url: vidRes.secure_url, key: vidRes.public_id };
            });

            const imageUrls = await Promise.all(imageUploadPromises);
            const videoUrls = await Promise.all(videoUploadPromises);

            const newComment = new Comment({ postId, content, author, images: imageUrls, videos: videoUrls });
            const savedComment = await newComment.save();
            res.status(201).json({ ...constResponse.ok, savedComment });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
        res.json({ ...constResponse.ok, comments });
    } catch (error) {
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};

export const updateComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    if (!commentId) return res.status(404).json({ ...constResponse.missing, message: 'commentId is required' });

    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

            const images = files.images ? (Array.isArray(files.images) ? files.images : [files.images]) : [];
            const videos = files.videos ? (Array.isArray(files.videos) ? files.videos : [files.videos]) : [];

            // Fetch the current comment data
            const comment = await Comment.findById(commentId);
            if (!comment) return res.status(404).json({ error: 'Comment not found' });

            const oldImageKeys = comment.images.map(image => image.key);
            const oldVideoKeys = comment.videos.map(video => video.key);

            const imageUploadPromises = images.map(async (image) => {
                const imgRes = await cloudinary.uploader.upload(image.filepath);
                return { url: imgRes.secure_url, key: imgRes.public_id };
            });

            const videoUploadPromises = videos.map(async (video) => {
                const vidRes = await cloudinary.uploader.upload(video.filepath, { resource_type: 'video' });
                return { url: vidRes.secure_url, key: vidRes.public_id };
            });

            const imageUrls = await Promise.all(imageUploadPromises);
            const videoUrls = await Promise.all(videoUploadPromises);

            // Delete old images from Cloudinary if new images are uploaded
            if (images.length > 0) {
                const deleteOldImagesPromises = oldImageKeys.map(async (key) => {
                    try {
                        await cloudinary.uploader.destroy(key);
                    } catch (err) {
                        console.error('Error deleting image from Cloudinary:', err);
                    }
                });
                await Promise.all(deleteOldImagesPromises);
            }

            // Delete old videos from Cloudinary if new videos are uploaded
            if (videos.length > 0) {
                const deleteOldVideosPromises = oldVideoKeys.map(async (key) => {
                    try {
                        await cloudinary.uploader.destroy(key, { resource_type: 'video' });
                    } catch (err) {
                        console.error('Error deleting video from Cloudinary:', err);
                    }
                });
                await Promise.all(deleteOldVideosPromises);
            }

            const updatedData: any = { content };
            if (imageUrls.length) updatedData.images = imageUrls;
            if (videoUrls.length) updatedData.videos = videoUrls;

            const updatedComment = await Comment.findByIdAndUpdate(commentId, updatedData, { new: true });
            res.json({ ...constResponse.ok, updatedComment });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};


export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    try {
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if (!deletedComment) return res.status(404).json({ error: 'Comment not found' });

        res.json({ ...constResponse.ok, message: 'Comment and related comments deleted successfully' });
    } catch (error) {
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });

    }
};
