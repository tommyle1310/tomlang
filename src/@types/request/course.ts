import { Request } from "express";
import { ObjectId } from "mongoose";
import { RequestWithFiles } from "../../middleware/fileParser";
import { ILesson } from "../../models/Lesson";

export interface createCourseRequest extends Request {
    body: {
        title: string, description: string,
        price: string, level: string,
        language: string, prerequisites: string | string[],
        author: ObjectId, category: string | string[]
    }
}
export interface updateCourseRequest extends RequestWithFiles {
    body: {
        title: string, description: string,
        price: string, level: string,
        language: string, prerequisites: string,
        author: ObjectId, publishedDate: Date,
        poster: { url: string, key: string },
        recommendation: ObjectId,
        lesson: ILesson[]
    }
}