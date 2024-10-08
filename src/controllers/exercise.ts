import { Request, Response } from "express"
import { constResponse } from "../utils/constants/commonMessages"
import Category from "../models/Category"
import { isValidObjectId, ObjectId } from "mongoose"
import { addExerciseRequest } from "../@types/request/exercise";
import Exercise from "../models/Exercise";
import Lesson from "../models/Lesson";
import Course from "../models/Course";
import UserResponse from "../models/UserResponse";
import User from "../models/User";

export const addExercise = async (req: Request, res: Response) => {
    try {
        const { title, fromLesson, correctAnswer, explanation, options, question, courseId } = req.body;

        // Validate inputs
        if (!title || !question || correctAnswer === undefined || !options || !explanation) {
            return res.status(400).json({ ...constResponse.missing, message: 'Title / Question / Correct Answer / Options / Explanation are required.' });
        }

        if (typeof correctAnswer !== 'number' || !Number.isInteger(correctAnswer)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Correct Answer must be an integer representing the index of the correct option.' });
        }

        if (fromLesson && !isValidObjectId(fromLesson)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid lesson id' });
        }
        if (courseId && !isValidObjectId(courseId)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid courseId' });
        }

        if (!Array.isArray(options) || options.some(option => typeof option !== 'string')) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Options must be an array of strings.' });
        }

        // Ensure the correctAnswer is within the bounds of the options array
        if (correctAnswer < 0 || correctAnswer >= options.length) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Correct Answer index is out of bounds.' });
        }

        // Create and save the new Exercise
        const newExercise = new Exercise({ title, options, correctAnswer, explanation, question, fromLesson });
        const savedExercise = await newExercise.save();

        // If fromLesson is provided, update the Lesson
        if (fromLesson) {
            try {
                const updatedLesson = await Lesson.findByIdAndUpdate(
                    fromLesson,
                    { $addToSet: { exercises: savedExercise._id } },
                    { new: true }
                );

                if (!updatedLesson) {
                    return res.status(404).json({ ...constResponse.notfound, message: 'Lesson not found.' });
                }

                return res.json({ message: 'Exercise added to lesson successfully.', lesson: updatedLesson });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the lesson.' });
            }
        }

        if (courseId) {
            try {
                const updatedCourse = await Course.findByIdAndUpdate(
                    courseId,
                    { $addToSet: { exercises: savedExercise._id } },
                    { new: true }
                );

                if (!updatedCourse) {
                    return res.status(404).json({ ...constResponse.notfound, message: 'Course not found.' });
                }

                return res.json({ ...constResponse.ok, course: updatedCourse });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the course.' });
            }
        }

        // Respond with the newly created exercise
        return res.json({ message: 'Exercise created successfully.', exercise: savedExercise });
    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(422).json({ message: 'Duplicate field value error.' });
        } else {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while adding the exercise.' });
        }
    }
};

export const updateExercise = async (req: Request, res: Response) => {
    try {
        const { exerciseId } = req.params; // Get the Exercise ID from the request parameters
        const { title, fromLesson, correctAnswer, explanation, options, question, courseId } = req.body;

        // Validate input
        if (!exerciseId || !isValidObjectId(exerciseId)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid exercise exerciseId' });
        }

        if (correctAnswer !== undefined && (typeof correctAnswer !== 'number' || !Number.isInteger(correctAnswer))) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Correct Answer must be an integer representing the index of the correct option.' });
        }

        if (fromLesson && !isValidObjectId(fromLesson)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid lesson exerciseId' });
        }

        if (courseId && !isValidObjectId(courseId)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid courseId' });
        }

        if (options && (!Array.isArray(options) || options.some(option => typeof option !== 'string'))) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Options must be an array of strings.' });
        }

        if (correctAnswer !== undefined && options && (correctAnswer < 0 || correctAnswer >= options.length)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Correct Answer index is out of bounds.' });
        }

        // Update the Exercise
        const updateFields: any = { title, options, correctAnswer, explanation, question };

        // Remove undefined fields from the updateFields object
        Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

        const updatedExercise = await Exercise.findByIdAndUpdate(exerciseId, updateFields, { new: true });

        if (!updatedExercise) {
            return res.status(404).json({ ...constResponse.notfound, message: 'Exercise not found.' });
        }

        // If fromLesson is provided, update the Lesson
        if (fromLesson) {
            try {
                const updatedLesson = await Lesson.findByIdAndUpdate(
                    fromLesson,
                    { $addToSet: { exercises: updatedExercise._id } }, // Add exerciseId to exercises array if it does not already exist
                    { new: true }
                );

                if (!updatedLesson) {
                    return res.status(404).json({ ...constResponse.notfound, message: 'Lesson not found.' });
                }

                return res.json({ message: 'Exercise updated and added to lesson successfully.', lesson: updatedLesson });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the lesson.' });
            }
        }

        // If courseId is provided, update the Course
        if (courseId) {
            try {
                const updatedCourse = await Course.findByIdAndUpdate(
                    courseId,
                    { $addToSet: { exercises: updatedExercise._id } }, // Add exerciseId to exercises array if it does not already exist
                    { new: true }
                );

                if (!updatedCourse) {
                    return res.status(404).json({ ...constResponse.notfound, message: 'Course not found.' });
                }

                return res.json({ message: 'Exercise updated and added to course successfully.', course: updatedCourse });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the course.' });
            }
        }

        // Respond with the updated exercise
        return res.json({ message: 'Exercise updated successfully.', exercise: updatedExercise });
    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(422).json({ message: 'Duplicate field value error.' });
        } else {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while updating the exercise.' });
        }
    }
};

export const deleteExercise = async (req: Request, res: Response) => {
    try {
        const { exerciseId } = req.params;

        // Validate input
        if (!exerciseId || !isValidObjectId(exerciseId)) {
            return res.status(422).json({ ...constResponse.invalid, message: 'Invalid exercise ID' });
        }

        // Find and delete the Exercise
        const deletedExercise = await Exercise.findByIdAndDelete(exerciseId);
        console.log('check deel', deletedExercise);

        if (!deletedExercise) {
            return res.status(404).json({ ...constResponse.notfound, message: 'Exercise not found.' });
        }

        // Remove references from Lesson documents if applicable
        if (deletedExercise.fromLesson) {
            try {
                const updatedLesson = await Lesson.findByIdAndUpdate(
                    deletedExercise.fromLesson,
                    { $pull: { exercises: exerciseId } }, // Remove exerciseId from exercises array
                    { new: true }
                );

                if (!updatedLesson) {
                    console.error('Lesson not found when updating lesson references.');
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the lesson references.' });
            }
        }

        // Remove references from all Course documents that have the exerciseId
        try {
            const updatedCourses = await Course.updateMany(
                { exercises: exerciseId },
                { $pull: { exercises: exerciseId } } // Remove exerciseId from exercises array
            );

            if (updatedCourses.modifiedCount === 0) {
                console.error('No courses found with the given exerciseId.');
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating course references.' });
        }

        // Respond with a success message
        return res.json({ message: 'Exercise deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting the exercise.' });
    }
};


export const answerExercise = async (req: Request, res: Response) => {
    try {
        const { userId, exerciseId, selectedOptionIndex, answerTime } = req.body;

        // Validate inputs
        if (!userId || !exerciseId || selectedOptionIndex === undefined || answerTime === undefined) {
            return res.status(400).json({ message: 'UserId, exerciseId, selectedOptionIndex, and answerTime are required.' });
        }

        if (typeof selectedOptionIndex !== 'number' || !Number.isInteger(selectedOptionIndex)) {
            return res.status(422).json({ message: 'Selected Option Index must be an integer.' });
        }

        if (typeof answerTime !== 'number' || answerTime < 0) {
            return res.status(422).json({ message: 'Answer Time must be a positive number representing milliseconds.' });
        }

        // Check if the exercise and user exist
        if (!isValidObjectId(userId) || !isValidObjectId(exerciseId)) {
            return res.status(400).json({ message: 'Invalid User ID or Exercise ID.' });
        }

        const existingExercise = await Exercise.findById(exerciseId);
        const existingUser = await User.findById(userId);

        if (!existingExercise || !existingUser) {
            return res.status(404).json({ message: 'Exercise or User not found.' });
        }

        // Check if the selected option is correct
        const isCorrect = selectedOptionIndex === existingExercise.correctAnswer;

        // Find the latest attempt for this user and exercise
        const latestResponse = await UserResponse.findOne({ userId, exerciseId }).sort({ createdAt: -1 });

        let attempt = 1;
        if (latestResponse) {
            attempt = latestResponse.attempt + 1;
        }

        // Create and save the new UserResponse
        const newUserResponse = new UserResponse({
            userId,
            exerciseId,
            selectedOptionIndex,
            isCorrect,
            answerTime,
            attempt
        });
        await newUserResponse.save();

        // Update Exercise document
        await Exercise.findByIdAndUpdate(exerciseId, { $inc: { answerCount: 1 } });

        // Check and update User progress
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, 'progress.exercisesCompleted.exerciseId': exerciseId },
            {
                $set: { 'progress.lastActive': new Date() },
                $inc: { 'progress.exercisesCompleted.$.completionCount': 1 }
            },
            { new: true }
        );

        if (!updatedUser) {
            await User.findByIdAndUpdate(userId, {
                $set: { 'progress.lastActive': new Date() },
                $addToSet: {
                    'progress.exercisesCompleted': {
                        exerciseId,
                        completionCount: 1
                    }
                }
            }, { new: true });
        }

        return res.json({ message: 'Response recorded successfully.', userResponse: newUserResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while recording the response.' });
    }
};
