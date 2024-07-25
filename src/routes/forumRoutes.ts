import { Router } from 'express';
import { createPost, deletePost, getPostById, getPosts, updatePost } from '../controllers/post';
import { createComment, deleteComment, getCommentsByPostId, updateComment } from '../controllers/comment';
import { mustAuth, mustVerified } from '../middleware/auth';
const router = Router()
// Post routes
router.post('/posts', mustAuth, mustVerified, createPost);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPostById);
router.patch('/posts/:postId', mustAuth, mustVerified, updatePost);
router.delete('/posts/:postId', mustAuth, mustVerified, deletePost);

// Comment routes
router.post('/comments', mustAuth, mustVerified, createComment);
router.get('/comments/:postId', getCommentsByPostId);
router.patch('/comments/:commentId', mustAuth, mustVerified, updateComment);
router.delete('/comments/:commentId', mustAuth, mustVerified, deleteComment);

export default router