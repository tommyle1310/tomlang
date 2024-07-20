import express from 'express';
import { addLesson, deleteLesson, deleteLessonContent, getAllLessons, getSpecificLesson, updateLesson, updateLessonContent } from '../controllers/lesson';

const router = express.Router();

// get all lessons
router.get('/:courseId', getAllLessons);

// get specific lesson
router.get('/:courseId/:lessonId', getSpecificLesson);

// update lesson content
router.patch('/content/:lessonContentId', updateLessonContent);

// update lesson 
router.patch('/:lessonId', updateLesson);

// add lesson
router.post('/', addLesson);

// delete lesson content
router.delete('/content/:lessonContentId', deleteLessonContent);

// delete lesson
router.delete('/:lessonId', deleteLesson);


export default router