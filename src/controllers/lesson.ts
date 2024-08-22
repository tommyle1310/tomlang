import { Request, Response } from "express"
import { constResponse } from "../utils/constants/commonMessages"
import Course from "../models/Course"
import mongoose, { isValidObjectId, ObjectId, Types } from "mongoose"
import { getAllLessonsHelper } from "../utils/aggregation/lesson"
import { addLessonRequest } from "../@types/request/lesson"
import Lesson from "../models/Lesson"
import LessonContent from "../models/LessonContent"
import Exercise from "../models/Exercise"


export const getAllLessons = async (req: Request, res: Response) => {
    const { courseId } = req.params
    if (!isValidObjectId(courseId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid courseId' })
    const lessons = await getAllLessonsHelper(courseId)
    if (!lessons) {
        return res.status(422).json({ ...constResponse.notfound, message: 'Cannot find this course.' })
    }
    return res.json({ ...constResponse.ok, lessons })
}

export const getSpecificLesson = async (req: Request, res: Response) => {
    const { lessonId, courseId } = req.params
    if (!isValidObjectId(courseId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid courseId' })
    const lesson = await Course.aggregate([
        // Match the document with the specified courseId
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
        // Unwind the lessons array to process each lesson ID separately
        { $unwind: "$lessons" },
        {
            $lookup: {
                from: "lessons", // The name of your Lessons collection
                localField: "lessons", // The field in your course collection that contains the lesson ID
                foreignField: "_id", // The field in the Lessons collection that contains the _id
                as: "lessonDetails" // The name of the field in the output documents that will contain the joined lessons
            }
        },
        // Unwind the lessonDetails array to get a flat structure
        {
            $unwind: "$lessonDetails"
        },
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
        {
            $lookup: {
                from: "lessoncontents", // The name of your Content collection
                localField: "lessonDetails.content", // The field in lessonDetails that contains the content IDs
                foreignField: "_id", // The field in the Content collection that contains the _id
                as: "lessonContent" // The name of the field in the output documents that will contain the joined content
            }
        },
        // Replace the content field in lessonDetails with the joined content details
        {
            $addFields: {
                "lessonDetails.content": {
                    $map: {
                        input: "$lessonDetails.content",
                        as: "contentId",
                        in: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$lessonContent",
                                        as: "content",
                                        cond: { $eq: ["$$content._id", "$$contentId"] }
                                    }
                                },
                                0
                            ]
                        }
                    }
                }
            }
        },
        // Remove the lessonContent field from the root document
        {
            $project: {
                lessonContent: 0
            }
        },
        {
            $project: {
                lessonDetails: 1,
                _id: 0 // Exclude _id from the final output if you don't need it
            }
        },
        {
            $replaceRoot: {
                newRoot: "$lessonDetails"
            }
        },

    ])
    if (!lesson) return res.status(404).json({ ...constResponse.notfound, message: 'Cannot find this lesson.' })
    return res.json({ ...constResponse.ok, lesson })
}

export const addLesson = async (req: addLessonRequest, res: Response) => {
    const { content, courseId, title } = req.body;

    // Validate input fields
    if (!content || !courseId || !title || !Array.isArray(content) || content.length === 0) {
        return res.status(400).json({ ...constResponse.missing });
    }
    if (!isValidObjectId(courseId)) {
        return res.status(422).json({ ...constResponse.invalid, message: 'CourseId is invalid' });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ ...constResponse.notfound, message: 'Course not found' });
    }

    // Create and save multiple lesson content items
    const lessonContentIds = [];
    try {
        for (const c of content) {
            const lessonContent = new LessonContent({ content: c });
            await lessonContent.save();
            lessonContentIds.push(lessonContent._id);
        }

        // Create a new lesson
        const lesson = new Lesson({
            title,
            content: lessonContentIds
        });

        // Save the lesson
        await lesson.save();

        // Update the course to include the new lesson
        await Course.updateOne(
            { _id: courseId },
            { $addToSet: { lessons: lesson._id } }
        );

        return res.status(201).json({ ...constResponse.ok, lesson });
    } catch (err) {
        console.error('Error adding lesson:', err);
        return res.status(500).json({ ...constResponse.unknown });
    }
};

export const addLessonAtIndex = async (req: addLessonRequest, res: Response) => {
    const { content, courseId, title } = req.body;
    const { index } = req.params
    const i = +index

    // Validate input fields
    if (!content || !courseId || !title || i === undefined || !Array.isArray(content) || content.length === 0) {
        return res.status(400).json({ ...constResponse.missing });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ ...constResponse.notfound, message: 'Course not found' });
    }

    // Validate the index
    if (i < 0 || i > course.lessons.length) {
        return res.status(400).json({ ...constResponse.invalid, message: 'Invalid index' });
    }

    // Create and save multiple lesson content items
    const lessonContentIds: Types.ObjectId[] = [];
    try {
        for (const c of content) {
            const lessonContent = new LessonContent({ content: c });
            await lessonContent.save();
            lessonContentIds.push(lessonContent._id as Types.ObjectId); // Cast _id as ObjectId
        }

        // Create a new lesson
        const lesson = new Lesson({
            title,
            content: lessonContentIds
        });

        // Save the lesson
        await lesson.save();

        // Insert the lesson at the specified index
        course.lessons.splice(i, 0, lesson._id as Types.ObjectId); // Use Types.ObjectId for _id
        await course.save();

        return res.status(201).json({ ...constResponse.ok, lesson });
    } catch (err) {
        console.error('Error adding lesson at index:', err);
        return res.status(500).json({ ...constResponse.unknown });
    }
};







export const updateLessonContent = async (req: Request, res: Response) => {
    const { lessonContentId } = req.params;
    const { updatedLessonContent } = req.body;

    if (!lessonContentId || !updatedLessonContent) return res.status(400).json({ ...constResponse.missing })

    // Validate ObjectId
    if (!mongoose.isValidObjectId(lessonContentId)) {
        return res.status(422).json({ ...constResponse.invalid });
    }

    try {
        // Find and update the lesson content
        const lessonContent = await LessonContent.findOneAndUpdate(
            { _id: lessonContentId },
            { content: updatedLessonContent }, // Assuming req.body contains the fields to update
            { new: true } // Returns the updated document
        );

        // Check if the document was found
        if (!lessonContent) {
            return res.status(404).json({ ...constResponse.notfound });
        }

        // Respond with the updated lesson content
        return res.json({ ...constResponse.ok, lessonContent });
    } catch (error) {
        // Handle any errors that occur during the operation
        console.error(error);
        return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the lesson content.' });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const { lessonContent, title, lessonContentId } = req.body;

    if (!lessonId || !lessonContent) {
        return res.status(400).json({ ...constResponse.missing });
    }

    const lessonExists = await Lesson.findById(lessonId);
    if (!lessonExists) {
        return res.status(404).json({ ...constResponse.notfound, message: 'Lesson not found' });
    }

    // Validate ObjectId
    if (!mongoose.isValidObjectId(lessonId) || (lessonContentId && !mongoose.isValidObjectId(lessonContentId))) {
        return res.status(422).json({ ...constResponse.invalid });
    }

    const modifiedLessonContent = Array.isArray(lessonContent) ? lessonContent[0] : lessonContent;

    try {
        let contentDoc;
        // Find or create the LessonContent
        if (lessonContentId) {
            contentDoc = await LessonContent.findById(lessonContentId);
            if (!contentDoc) {
                // If LessonContent does not exist, create it
                contentDoc = await LessonContent.create({ content: modifiedLessonContent });
                // Update lessonContentId to the newly created contentDoc ID
                const newLessonContentId = contentDoc._id;
                // Update Lesson with the new content ID
                await Lesson.findOneAndUpdate(
                    { _id: lessonId },
                    { $addToSet: { content: newLessonContentId }, title },
                    { new: true, upsert: true }
                );
            } else {
                // If it exists, update it
                contentDoc = await LessonContent.findByIdAndUpdate(
                    lessonContentId,
                    { $set: { content: modifiedLessonContent, title } },
                    { new: true, upsert: true }
                );
                // Update Lesson with the existing content ID
                await Lesson.findOneAndUpdate(
                    { _id: lessonId },
                    { $addToSet: { content: lessonContentId }, title },
                    { new: true, upsert: true }
                );
            }
        } else {
            // Create new LessonContent and update Lesson
            contentDoc = await LessonContent.create({ content: modifiedLessonContent });
            await Lesson.findOneAndUpdate(
                { _id: lessonId },
                { $addToSet: { content: contentDoc._id }, title },
                { new: true, upsert: true }
            );
        }

        // Find and return the updated Lesson
        const updatedLesson = await Lesson.findById(lessonId);
        if (!updatedLesson) {
            return res.status(404).json({ ...constResponse.notfound });
        }

        return res.json({ ...constResponse.ok, lesson: updatedLesson });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the lesson.' });
    }
};

export const deleteLessonContent = async (req: Request, res: Response) => {
    const { lessonContentId } = req.params;

    if (!lessonContentId) {
        return res.status(400).json({ ...constResponse.missing });
    }

    // Validate ObjectId
    if (!mongoose.isValidObjectId(lessonContentId)) {
        return res.status(422).json({ ...constResponse.invalid });
    }

    try {
        // Find and delete the LessonContent
        const lessonContent = await LessonContent.findOneAndDelete({ _id: lessonContentId });

        // Check if the document was found and deleted
        if (!lessonContent) {
            return res.status(404).json({ ...constResponse.notfound });
        }

        // Remove the lessonContentId from all related lessons
        await Lesson.updateMany(
            { content: lessonContentId },
            { $pull: { content: lessonContentId } }
        );

        // Respond with a success message
        return res.json({ ...constResponse.ok, message: 'Lesson content and related lessons updated successfully' });
    } catch (error) {
        // Handle any errors that occur during the operation
        console.error(error);
        return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while deleting the lesson content.' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;

    if (!lessonId) return res.status(400).json({ ...constResponse.missing });

    // Validate ObjectId
    if (!mongoose.isValidObjectId(lessonId)) {
        return res.status(422).json({ ...constResponse.invalid });
    }

    console.log('lesson', lessonId);

    try {
        // Find the lesson to get the content references
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ ...constResponse.notfound });
        }

        // Get all the content IDs from the lesson
        const contentIds = lesson.content;

        // Delete all LessonContent documents referenced by the lesson
        await LessonContent.deleteMany({ _id: { $in: contentIds } });

        // Delete exercises associated with the lesson
        await Exercise.deleteMany({ fromLesson: lessonId });

        // Delete the lesson itself
        await Lesson.findByIdAndDelete(lessonId);

        await Course.updateMany(
            { lessons: { $in: [lessonId] } },
            { $pull: { lessons: lessonId } }
        );

        // Respond with success message
        return res.json({ ...constResponse.ok, message: `Lesson ${lessonId} and its relevant content and exercises have been deleted` });
    } catch (error) {
        // Handle any errors that occur during the operation
        console.error(error);
        return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while deleting the lesson.' });
    }
};
