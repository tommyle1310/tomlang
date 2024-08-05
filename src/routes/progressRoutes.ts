import express, { Request, Response } from 'express';
import { mustAuth } from '../middleware/auth';
import { getCourseProgress, updateCourseProgress } from '../controllers/progress';

const router = express.Router();

router.patch('/update-course-progress/:courseId', mustAuth, updateCourseProgress);

router.get('/:courseId', mustAuth, getCourseProgress);

export default router
