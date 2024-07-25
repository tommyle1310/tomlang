import { Router } from 'express';
import { createPost, deletePost, getPostById, getPosts, updatePost } from '../controllers/post';
import { createComment, deleteComment, getCommentsByPostId, updateComment } from '../controllers/comment';
import { mustAuth } from '../middleware/auth';
const router = Router()
// Post routes
router.post('/posts', mustAuth, createPost);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPostById);
router.patch('/posts/:postId', mustAuth, updatePost);
router.delete('/posts/:postId', mustAuth, deletePost);

// Comment routes
router.post('/comments', mustAuth, createComment);
router.get('/comments/:postId', getCommentsByPostId);
router.patch('/comments/:commentId', mustAuth, updateComment);
router.delete('/comments/:commentId', mustAuth, deleteComment);

export default router