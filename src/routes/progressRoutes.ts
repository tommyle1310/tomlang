import express, { Request, Response } from 'express';
import { mustAuth } from '../middleware/auth';
import { updateCourseProgress } from '../controllers/progress';

const router = express.Router();

router.patch('/update-course-progress/:courseId', mustAuth, updateCourseProgress);

export default router
