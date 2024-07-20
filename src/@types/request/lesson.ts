import { Request } from "express";
import { ObjectId } from "mongoose";

export interface addLessonRequest extends Request {
    body: {
        title: string,
        content: string,
        courseId: ObjectId
    }
}