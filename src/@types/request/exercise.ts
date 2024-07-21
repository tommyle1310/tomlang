import { Request } from "express";
import { ObjectId } from "mongoose";

export interface addExerciseRequest extends Request {
    body: {
        title: string,
        fromLesson: ObjectId,
        options: string[],
        correctAnswer: string,
        question: string,
        explanation: string,
        courseId: ObjectId
    }
}