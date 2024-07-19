import express, { Request, Response } from 'express';
import { createCourse, getAllCourses } from '../controllers/course';

const router = express.Router();

// GET /api/lessons: Get all lessons.
router.get('/', getAllCourses)

// GET /api/lessons/: Get a specific lesson.
// router.get('/')

// POST /api/lessons: Create a new lesson.
router.post('/', createCourse)
// PUT /api/lessons/: Update a lesson.
// DELETE /api/lessons/: Delete a lesson.
// GET /api/lessons/content/: Get lesson content.
// POST /api/lessons/exercise/: Submit lesson exercise.
// GET /api/lessons/recommendations/: Get lesson recommendations.

export default router