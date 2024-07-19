import { Request } from "express";
import { ObjectId } from "mongoose";

export interface createCourseRequest extends Request {
    body: {
        title: string, description: string,
        price: string, level: string,
        language: string, prerequisites: string,
        author: ObjectId
    }
}