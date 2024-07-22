import mongoose, { ObjectId } from "mongoose";
import Course from "../../models/Course";

export const getAllCoursesAggregation = async (page: number, limit: number) => {
    const courses = await Course.aggregate([
        // Stage 1: Skip and limit for pagination
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // Stage 2: Lookup to join Exercise collection
        {
            $lookup: {
                from: 'exercises', // Name of the exercises collection
                localField: 'exercises', // Field from the Course collection
                foreignField: '_id', // Field from the Exercise collection
                as: 'exerciseDetails' // Alias for the joined documents
            }
        },
        // Stage 3: Lookup to join Lesson collection
        {
            $lookup: {
                from: 'lessons', // Name of the lessons collection
                localField: 'lessons', // Field from the Course collection
                foreignField: '_id', // Field from the Lesson collection
                as: 'lessonDetails' // Alias for the joined documents
            }
        },
        // Stage 4: Lookup to join Language collection
        {
            $lookup: {
                from: 'languages', // Name of the languages collection
                localField: 'language', // Field from the Course collection
                foreignField: '_id', // Field from the Language collection
                as: 'languageDetails' // Alias for the joined documents
            }
        },
        {
            $lookup: {
                from: 'categories',
                let: { categoryArray: "$categories" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", { $map: { input: "$$categoryArray", as: "category", in: { $toObjectId: "$$category" } } }]
                            }
                        }
                    }
                ],
                as: 'categoryDetails'
            }
        },
        // Stage 5: Lookup to join User collection for author details
        {
            $lookup: {
                from: 'users',
                let: { authorId: { $toObjectId: "$author" } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$authorId"] }
                        }
                    }
                ],
                as: 'authorDetails'
            }
        },
        // Stage 6: Project the fields you want to include in the response
        {
            $project: {
                title: 1,
                description: 1,
                poster: 1,
                recommendations: 1,
                likes: 1,
                price: 1,
                level: 1,
                enrollmentCount: 1,
                rating: 1,
                reviews: 1,
                publishDate: 1,
                lastUpdated: 1,
                resources: 1,
                createdAt: 1,
                updatedAt: 1,
                exerciseDetails: 1,
                lessonDetails: 1,
                categoryDetails: 1,
                languageDetails: { $arrayElemAt: ["$languageDetails", 0] },
                authorDetails: {
                    $arrayElemAt: [
                        {
                            $map: {
                                input: '$authorDetails',
                                as: 'author',
                                in: {
                                    name: '$$author.name',
                                    email: '$$author.email',
                                    _id: '$$author._id',
                                }
                            }
                        },
                        0
                    ]
                }
            }
        },

    ]);
    return courses
}
export const getSpecificCourseDetailAggregation = async (page: number, limit: number, courseId: string) => {
    const courses = await Course.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
        // Stage 1: Skip and limit for pagination
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // Stage 2: Lookup to join Exercise collection
        {
            $lookup: {
                from: 'exercises', // Name of the exercises collection
                localField: 'exercises', // Field from the Course collection
                foreignField: '_id', // Field from the Exercise collection
                as: 'exerciseDetails' // Alias for the joined documents
            }
        },
        // Stage 3: Lookup to join Lesson collection
        {
            $lookup: {
                from: 'lessons', // Name of the lessons collection
                localField: 'lessons', // Field from the Course collection
                foreignField: '_id', // Field from the Lesson collection
                as: 'lessonDetails' // Alias for the joined documents
            }
        },
        // Stage 4: Lookup to join Language collection
        {
            $lookup: {
                from: 'languages', // Name of the languages collection
                localField: 'language', // Field from the Course collection
                foreignField: '_id', // Field from the Language collection
                as: 'languageDetails' // Alias for the joined documents
            }
        },
        // Stage 5: Lookup to join Categories collection
        {
            $lookup: {
                from: 'categories',
                let: { categoryArray: "$categories" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", { $map: { input: "$$categoryArray", as: "category", in: { $toObjectId: "$$category" } } }]
                            }
                        }
                    }
                ],
                as: 'categoryDetails'
            }
        },
        // Stage 6: Lookup to join User collection for author details
        {
            $lookup: {
                from: 'users',
                let: { authorId: { $toObjectId: "$author" } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$authorId"] }
                        }
                    }
                ],
                as: 'authorDetails'
            }
        },
        // Stage 7: Project the fields you want to include in the response
        {
            $project: {
                title: 1,
                description: 1,
                poster: 1,
                recommendations: 1,
                likes: 1,
                price: 1,
                level: 1,
                enrollmentCount: 1,
                rating: 1,
                reviews: 1,
                publishDate: 1,
                lastUpdated: 1,
                resources: 1,
                createdAt: 1,
                updatedAt: 1,
                exerciseDetails: 1,
                lessonDetails: 1,
                categoryDetails: 1,
                languageDetails: { $arrayElemAt: ["$languageDetails", 0] },
                authorDetails: {
                    $arrayElemAt: [
                        {
                            $map: {
                                input: '$authorDetails',
                                as: 'author',
                                in: {
                                    name: '$$author.name',
                                    email: '$$author.email',
                                    _id: '$$author._id',
                                }
                            }
                        },
                        0
                    ]
                }
            }
        },
    ]);

    return courses[0]
}

export const courseCategoryAggregation = async (page: number, limit: number, courseId: string) => {
    const courses = await Course.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
        // Stage 1: Skip and limit for pagination
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // Stage 5: Lookup to join Categories collection
        {
            $lookup: {
                from: 'categories',
                let: { categoryArray: "$categories" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", { $map: { input: "$$categoryArray", as: "category", in: { $toObjectId: "$$category" } } }]
                            }
                        }
                    }
                ],
                as: 'categoryDetails'
            }
        },
        // Stage 7: Project the fields you want to include in the response
        {
            $project: {
                categoryDetails: { $arrayElemAt: ["$categoryDetails", 0] },
                _id: 0
            }
        },
        {
            $replaceRoot: {
                newRoot: "$categoryDetails"
            }
        },
    ]);
    return courses
}
