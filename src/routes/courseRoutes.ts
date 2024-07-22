import express, { Request, Response } from 'express';
import { createCourse, getAllCourses, getCourseDetail, getCourseRecommendations, getPurchasedCourses, purchaseCourse, updateCourse, updateCourseProgress } from '../controllers/course';
import fileParser from '../middleware/fileParser';
import { mustAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/lessons: Get all lessons.
router.get('/', getAllCourses)
router.get('/:courseId', getCourseDetail)

// GET /api/lessons/: Get a specific lesson.
// router.get('/')

// POST /api/lessons: Create a new lesson.
router.post('/', createCourse)

// PUT /api/lessons/: Update a lesson.
router.patch('/:courseId', updateCourse)

router.post('/purchase', mustAuth, purchaseCourse);

router.patch('/update-course-progress/:courseId', mustAuth, updateCourseProgress);

router.get('/purchase/:userId', mustAuth, getPurchasedCourses);

router.get('/recommendation/:courseId', mustAuth, getCourseRecommendations);

// DELETE /api/lessons/: Delete a lesson.
// GET /api/lessons/content/: Get lesson content.
// POST /api/lessons/exercise/: Submit lesson exercise.
// GET /api/lessons/recommendations/: Get lesson recommendations.

export default router