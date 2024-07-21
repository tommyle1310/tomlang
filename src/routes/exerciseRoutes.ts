import express from 'express';
import { addExercise, answerExercise, deleteExercise, updateExercise } from '../controllers/exercise';

const router = express.Router();

// // get all exercises
// router.get('/:courseId', getAllLessons);

// update exercises 
router.patch('/:exerciseId', updateExercise);

// add exercises
router.post('/', addExercise);


// add exercises
router.post('/answer', answerExercise);

// delete exercises
router.delete('/:exerciseId', deleteExercise);


export default router