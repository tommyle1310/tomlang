import { Request } from "express";
import { ObjectId } from "mongoose";
import { IContent, IExercise } from "../../models/Course";
import { RequestWithFiles } from "../../middleware/fileParser";

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
        exercises: IExercise[],
        content: IContent[]
    }
}