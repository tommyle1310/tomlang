import { Request, Response } from "express"
import Course from "../models/Course"
import { constResponse } from "../utils/constants/commonMessages";
import { createCourseRequest } from "../@types/request/course";
import { isValidObjectId } from "mongoose";
import User from "../models/User";

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