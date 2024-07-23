import { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course";
import User from "../models/User";

export const updateCourseProgress = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const { userId, completedLessonId } = req.body;

        if (!userId || !courseId || !completedLessonId) {
            return res.status(400).json({ message: 'UserId, courseId, and completedLessonId are required.' });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(completedLessonId)) {
            return res.status(400).json({ message: 'Invalid courseId or completedLessonId.' });
        }

        // Find the course and its lessons
        const course = await Course.findById(courseId).populate('lessons');
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Check if the completedLessonId is in the course's lessons
        const isLessonInCourse = course.lessons.some(lesson => lesson._id.toString() === completedLessonId.toString());
        if (!isLessonInCourse) {
            return res.status(404).json({ message: 'Lesson not found in this course.' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const courseIdObject = new mongoose.Types.ObjectId(courseId) as unknown as mongoose.Schema.Types.ObjectId;



        // Check if the course is already in the user's progress
        const courseProgressIndex = user.progress.coursesCompleted.findIndex(
            (entry) => entry.courseId.toString() === courseIdObject.toString()
        );

        if (courseProgressIndex >= 0) {
            // Update existing course progress entry
            const completedLessonIds = user.progress.coursesCompleted[courseProgressIndex].completedLessonIds || [];

            // Add the new lesson ID if it's not already present
            if (!completedLessonIds.includes(completedLessonId)) {
                completedLessonIds.push(completedLessonId);
            }

            // Calculate the new completion percentage
            const totalLessons = course.lessons.length;
            const completedLessonsCount = completedLessonIds.length;
            const completionPercentage = (completedLessonsCount / totalLessons) * 100;

            user.progress.coursesCompleted[courseProgressIndex] = {
                courseId: courseIdObject,
                completionPercentage,
                completedLessonIds
            };
        } else {
            // Add new course progress entry
            const totalLessons = course.lessons.length;
            const completionPercentage = (1 / totalLessons) * 100; // For a single lesson completed

            user.progress.coursesCompleted.push({
                courseId: courseIdObject,
                completionPercentage,
                completedLessonIds: [completedLessonId]
            });
        }

        // Update the last active timestamp
        user.progress.lastActive = new Date();

        // Save the updated user document
        await user.save();

        return res.json({ message: 'Course progress updated successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating course progress.' });
    }
};
