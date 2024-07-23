import { Request, Response } from "express"
import Course from "../models/Course"
import { constResponse } from "../utils/constants/commonMessages";
import { createCourseRequest } from "../@types/request/course";
import mongoose from "mongoose";
import User from "../models/User";
import * as formidable from 'formidable';
import { IncomingForm } from 'formidable';
import cloudinary from "../cloud";
import { courseCategoryAggregation, getAllCoursesAggregation, getSpecificCourseDetailAggregation } from "../utils/aggregation/course";


export const getAllCourses = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const courses = await getAllCoursesAggregation(page, limit)

        const totalCourses = await Course.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);

        return res.json({
            ...constResponse.ok,
            courses,
            totalPages,
            currentPage: page,
            totalCourses
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching courses', error });
    }
};

export const getCourseDetail = async (req: Request, res: Response) => {
    const { courseId } = req.params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const course = await getSpecificCourseDetailAggregation(page, limit, courseId)

        const totalCourses = await Course.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);

        return res.json({
            ...constResponse.ok,
            course,
            totalPages,
            currentPage: page,
            totalCourses
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching courses', error });
    }
};

export const createCourse = async (req: createCourseRequest, res: Response) => {
    try {
        const { author, description, language, level, prerequisites, price, title } = req.body
        if (!author || !description || !language || !level || !prerequisites || !price || !title) return res.status(404).json(constResponse.missing)
        if (!isValidObjectId(author)) return res.status(402).json({ ...constResponse.invalid, message: 'Invalid authorId' })
        const existingAuthor = await User.findById(author)
        if (!existingAuthor) return res.status(422).json({ ...constResponse.notfound, message: `Not found this author` })

        const checkExistedTitle = await Course.findOne({ title })
        if (checkExistedTitle) return res.status(422).json({ ...constResponse.duplicated, message: `This course's title already exists` })
        const course = new Course({ author, description, language, level, prerequisites, price, title });
        await course.save();
        return res.json({ ...constResponse.ok, course });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating course', error });
    }
};

const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

export const updateCourse = async (req: Request, res: Response) => {
    const form = new IncomingForm();
    const { courseId } = req.params;

    const existingCourse = await Course.findById(courseId)
    if (!existingCourse) return res.status(404).json({ ...constResponse.notfound, message: 'Course not found' })

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error parsing form data' });
        }

        const processArrayField = (fieldName: string) => {
            const field = fields[fieldName];
            if (Array.isArray(field)) {
                return field.filter(item => item != null && item !== '');
            }
            return [];
        };

        const authorId = Array.isArray(fields.author) ? fields.author[0] : fields.author;
        const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
        const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
        const level = Array.isArray(fields.level) ? fields.level[0] : fields.level;
        const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
        const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
        const publishedDate = Array.isArray(fields.publishedDate) ? fields.publishedDate[0] : fields.publishedDate;

        const prerequisites = processArrayField('prerequisites[]');
        const categories = processArrayField('categories[]');
        const exercises = processArrayField('exercises[]');
        const recommendations = processArrayField('recommendations[]');

        if (!isValidObjectId(authorId)) {
            console.error('Invalid author ID:', authorId);
            return res.status(422).json({ message: 'Invalid authorId' });
        }

        const existingAuthor = await User.findById(authorId);
        if (!existingAuthor) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const existingCourse = await Course.findOne({ title });
        if (existingCourse && existingCourse._id.toString() !== courseId) {
            return res.status(422).json({ message: 'A course with this title already exists' });
        }

        const course = await Course.findOneAndUpdate(
            { _id: courseId, author: authorId },
            {
                title,
                description,
                language,
                level,
                price,
                exercises,
                publishDate: publishedDate,
            },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Perform the update operation
        const updateResult = await Course.updateOne(
            { _id: courseId },
            {
                $addToSet: {
                    prerequisites: { $each: prerequisites },
                    recommendations: { $each: recommendations },
                    categories: { $each: categories }
                }
            }
        );

        const posterImg = files.poster && (Array.isArray(files.poster) ? files.poster[0] : files.poster);
        if (posterImg) {
            if (course.poster?.key) {
                try {
                    await cloudinary.uploader.destroy(course.poster.key);
                } catch (err) {
                    console.error('Error deleting poster from Cloudinary:', err);
                }
            }

            try {
                const posterRes = await cloudinary.uploader.upload(posterImg.filepath, {
                    width: 300, height: 300,
                    crop: 'thumb', gravity: 'face'
                });

                course.poster = { url: posterRes.secure_url, key: posterRes.public_id };
                await course.save();
            } catch (err) {
                console.error('Error uploading new poster to Cloudinary:', err);
                return res.status(500).json({ message: 'Failed to upload new poster image.' });
            }
        }

        return res.json({ ...constResponse.ok });
    });
};

export const purchaseCourse = async (req: Request, res: Response) => {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({ ...constResponse.missing, error: 'User ID and Course ID are required' });
    }

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(courseId)) {
        return res.status(422).json({ ...constResponse.invalid, error: 'Invalid User ID or Course ID' });
    }

    try {
        // Find the user and the course
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user) {
            return res.status(404).json({ ...constResponse.notfound, error: 'User not found' });
        }

        if (!course) {
            return res.status(404).json({ ...constResponse.notfound, error: 'Course not found' });
        }

        // Check if the course is already purchased
        const alreadyPurchased = user.purchased?.some(p =>
            p.type === 'Course' && p.item.toString() === courseId
        );

        if (alreadyPurchased) {
            return res.status(400).json({ ...constResponse.duplicated, error: 'Course already purchased' });
        }

        // Add the course to the user's purchased list
        user.purchased?.push({ type: 'Course', item: courseId });

        // Update the user's purchased list
        await user.save();

        // Optionally, you might want to increment the enrollment count of the course
        await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

        return res.status(200).json({ ...constResponse.ok });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while purchasing the course' });
    }
};

export const getPurchasedCourses = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ ...constResponse.missing, error: 'User ID is required' });
    }

    try {
        // Validate ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(422).json({ ...constResponse.invalid, error: 'Invalid User ID' });
        }

        // Find the user with populated purchased items
        const user = await User.findById(userId).populate({
            path: 'purchased.item',
            match: { type: 'Course' }, // Only populate if the type is 'Course'
            select: 'title description price poster' // Adjust fields as needed
        });

        if (!user) {
            return res.status(404).json({ ...constResponse.notfound, error: 'User not found' });
        }

        // Filter out non-course items
        const purchasedCourses = user.purchased?.filter(p => p.type === 'Course');

        return res.status(200).json({ ...constResponse.ok, purchasedCourses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching purchased courses' });
    }
};

export const getCourseRecommendations = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!courseId) {
        return res.status(400).json({ ...constResponse.missing, error: 'Course ID is required' });
    }

    try {
        // Validate ObjectId
        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(422).json({ ...constResponse.invalid, error: 'Invalid course ID' });
        }

        const listCourseCategories = await courseCategoryAggregation(page, limit, courseId)
        if (listCourseCategories.length === 0) {
            throw new Error('No category details found.');
        }

        const { _id: categoryId, tags: categoryTags } = listCourseCategories[0];

        // Step 2: Find courses matching the extracted category and tags
        const matchingCourses = await Course.find({
            $or: [
                { categories: categoryId },
                { tags: { $in: categoryTags } }
            ],
        }, {
            poster: 1, likes: 1, enrollmentCount: 1, price: 1, level: 1, language: 1
        }).populate('language');

        const courses = matchingCourses
        return res.status(200).json({ ...constResponse.ok, courses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching purchased courses' });
    }
};


