import { Request, Response } from "express"
import Course from "../models/Course"
import { constResponse } from "../utils/constants/commonMessages";
import { createCourseRequest, updateCourseRequest } from "../@types/request/course";
import mongoose from "mongoose";
import User from "../models/User";
import * as formidable from 'formidable';
import { IncomingForm } from 'formidable';
import cloudinary from "../cloud";
import { validateContent } from "../utils/joi";


export const getAllCourses = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
        const courses = await Course.find()
            .skip((page - 1) * limit)
            .limit(limit);
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
}

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

export const updateCourse = async (req: updateCourseRequest, res: Response) => {
    const form = new IncomingForm();
    const { courseId } = req.params;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error parsing form data' });
        }

        // Function to process array fields and remove null or empty values
        const processArrayField = (fieldName: string) => {
            const field = fields[fieldName];
            if (Array.isArray(field)) {
                return field.filter(item => item != null && item !== '');
            }
            return [];
        };

        // Extract fields
        const authorId = Array.isArray(fields.author) ? fields.author[0] : fields.author;
        const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
        const language = Array.isArray(fields.language) ? fields.language[0] : fields.language;
        const level = Array.isArray(fields.level) ? fields.level[0] : fields.level;
        const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
        const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
        const publishedDate = Array.isArray(fields.publishedDate) ? fields.publishedDate[0] : fields.publishedDate;
        const content = Array.isArray(fields.content) ? fields.content.join('\n') : fields.content;

        // Process array fields with proper filtering
        const prerequisites = processArrayField('prerequisites[]');
        const categories = processArrayField('categories[]');
        const exercises = processArrayField('exercises[]');
        const recommendations = processArrayField('recommendations[]');

        // Validation
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

        // Update the course with other fields
        const course = await Course.findOneAndUpdate(
            { _id: courseId, author: authorId },
            {
                title,
                description,
                language,
                level,
                price,
                content,
                exercises,
                publishDate: publishedDate,
            },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update arrays using addToSet, making sure to filter out any null values
        await Course.updateOne(
            { _id: courseId },
            {
                $addToSet: {
                    prerequisites: { $each: prerequisites },
                    recommendations: { $each: recommendations },
                    categories: { $each: categories }
                }
            }
        );

        // Handle poster image upload
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

        return res.json({ message: 'Course updated successfully', course });
    });
};






