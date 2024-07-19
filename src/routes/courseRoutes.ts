import express, { Request, Response } from 'express';
import { createCourse, getAllCourses, updateCourse } from '../controllers/course';
import fileParser from '../middleware/fileParser';

const router = express.Router();

// GET /api/lessons: Get all lessons.
router.get('/', getAllCourses)

// GET /api/lessons/: Get a specific lesson.
// router.get('/')

// POST /api/lessons: Create a new lesson.
router.post('/', createCourse)
// PUT /api/lessons/: Update a lesson.
router.patch('/:courseId', updateCourse)

// DELETE /api/lessons/: Delete a lesson.
// GET /api/lessons/content/: Get lesson content.
// POST /api/lessons/exercise/: Submit lesson exercise.
// GET /api/lessons/recommendations/: Get lesson recommendations.

export default router