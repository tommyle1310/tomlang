import { Request, Response } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { constResponse } from "../utils/constants/commonMessages";
import cloudinary from "../cloud";
import { IncomingForm } from 'formidable';
import { isValidObjectId } from "mongoose";

export const createPost = async (req: Request, res: Response) => {
    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
            const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;
            const author = Array.isArray(fields.author) ? fields.author[0] : fields.author;

            if (!title || !author || !content) {
                return res.status(400).json({ ...constResponse.missing, message: 'Title, author, and content must be provided' });
            }
            if (!isValidObjectId(author)) {
                return res.status(400).json({ ...constResponse.invalid, message: 'Invalid authorId' });
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

            const newPost = new Post({ title, content, author, images: imageUrls, videos: videoUrls });
            const savedPost = await newPost.save();
            res.status(201).json({ ...constResponse.ok, savedPost });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 posts per page if not provided

    try {
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            ...constResponse.ok,
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        });
    } catch (error) {
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
        return res.status(422).json({ ...constResponse.invalid, message: 'Invalid post ID' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

        const postWithComments = {
            ...post.toObject(),
            comments: comments
        };

        res.json({ ...constResponse.ok, post: postWithComments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};


export const updatePost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    if (!postId) return res.status(404).json({ ...constResponse.missing, message: 'postId is required' });

    try {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Error parsing form data' });
            }

            const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
            const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

            const images = files.images ? (Array.isArray(files.images) ? files.images : [files.images]) : [];
            const videos = files.videos ? (Array.isArray(files.videos) ? files.videos : [files.videos]) : [];

            // Fetch the current post data
            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ error: 'Post not found' });

            const oldImageKeys = post.images.map(image => image.key);
            const oldVideoKeys = post.videos.map(video => video.key);

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

            const updatedData: any = { title, content };
            if (imageUrls.length) updatedData.images = imageUrls;
            if (videoUrls.length) updatedData.videos = videoUrls;

            const updatedPost = await Post.findByIdAndUpdate(postId, updatedData, { new: true });
            res.json({ ...constResponse.ok, updatedPost });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) return res.status(404).json({ error: 'Post not found' });

        // Delete all comments related to the post
        await Comment.deleteMany({ postId });

        res.json({ ...constResponse.ok, message: 'Post and related comments deleted successfully' });
    } catch (error) {
        res.status(500).json({ ...constResponse.unknown, error: 'Internal Server Error' });

    }
};
