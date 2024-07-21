import express from 'express';
import { addExercise, deleteExercise, updateExercise } from '../controllers/exercise';

const router = express.Router();

// // get all exercises
// router.get('/:courseId', getAllLessons);

// update exercises 
router.patch('/:exerciseId', updateExercise);

// add exercises
router.post('/', addExercise);

// delete exercises
router.delete('/:exerciseId', deleteExercise);


export default router