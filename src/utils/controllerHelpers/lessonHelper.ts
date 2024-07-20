import mongoose, { isValidObjectId } from "mongoose"
import Course from "../../models/Course"

export const getAllLessonsHelper = async (courseId: string) => {
    const lessons = await Course.aggregate([
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
        // // Unwind the lessonDetails array to get a flat structure
        {
            $unwind: "$lessonDetails"
        },
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
    return lessons
}