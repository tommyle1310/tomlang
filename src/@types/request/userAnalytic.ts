import { Request } from "express";
import { ObjectId } from "mongoose";
import { RequestWithFiles } from "../../middleware/fileParser";
import { ILesson } from "../../models/Lesson";

export interface getDailyStatRequest extends Request {
    query: {
        userId: string, date: string
    }
}
export interface getMonthlyStatRequest extends Request {
    query: {
        userId: string, year: string, month: string
    }
}

export interface updateUserAnalyticsRequest extends Request {
    body: {
        date: Date, totalTimeSpent: number, coursesTimeSpent: number, lessonsTimeSpent: number, exercisesTimeSpent: number, coursesCompleted: number, lessonsCompleted: number, exercisesCompleted: number
    }
}