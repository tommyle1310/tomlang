import { Request, Response } from "express";
import { getDailyStatRequest, getMonthlyStatRequest, updateUserAnalyticsRequest } from "../@types/request/userAnalytic";
import UserAnalytics from "../models/UserAnalytic";
import { constResponse } from "../utils/constants/commonMessages";
import mongoose, { isValidObjectId } from "mongoose";

export const getDailyStats = async (req: getDailyStatRequest, res: Response) => {
    const { userId, date } = req.query;
    const queryDate = new Date(date);

    try {
        const analytics = await UserAnalytics.findOne({ userId, date: queryDate });
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getMonthlyStats = async (req: getMonthlyStatRequest, res: Response) => {
    const { userId, year, month } = req.query;
    console.log('check ', userId, year, month);

    if (!isValidObjectId(userId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid userid' })
    try {
        const analytics = await UserAnalytics.aggregateMonthlyStats(new mongoose.Types.ObjectId(userId), parseInt(year as string, 10), parseInt(month as string, 10));
        console.log(analytics);
        res.json(analytics);
    } catch (error) {
        console.log('er', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getAnalyticsData = async (req: Request, res: Response) => {
    const { userId, startDate, endDate, year, month, period } = req.body;

    if (!isValidObjectId(userId as string)) {
        return res.status(422).json({ ...constResponse.invalid, message: 'Invalid userid' });
    }

    let start: Date;
    let end: Date;

    try {
        switch (period) {
            case 'week': {
                if (!startDate) return res.status(400).json({ error: 'startDate is required for weekly stats' });
                start = new Date(startDate as string);
                end = new Date(start);
                end.setDate(start.getDate() + 6); // 7 days
                break;
            }
            case 'month': {
                if (!year || !month) return res.status(400).json({ error: 'year and month are required for monthly stats' });
                start = new Date(`${year}-${month}-01`);
                end = new Date(start);
                end.setMonth(start.getMonth() + 1);
                end.setDate(0); // Last day of the month
                break;
            }
            case 'year': {
                if (!year) return res.status(400).json({ error: 'year is required for yearly stats' });
                start = new Date(`${year}-01-01`);
                end = new Date(`${year}-12-31`);
                break;
            }
            default: {
                return res.status(400).json({ error: 'Invalid period. Use "week", "month", or "year"' });
            }
        }

        const matchCondition: any = {
            userId: new mongoose.Types.ObjectId(userId as string),
            date: { $gte: start, $lte: end }
        };

        const groupCondition: any = {
            _id: { $dayOfMonth: "$date" },
            totalTimeSpent: { $sum: "$totalTimeSpent" },
            exercisesTimeSpent: { $sum: "$exercisesTimeSpent" },
            coursesTimeSpent: { $sum: "$coursesTimeSpent" },
            lessonsTimeSpent: { $sum: "$lessonsTimeSpent" },
            coursesCompleted: { $sum: "$coursesCompleted" },
            lessonsCompleted: { $sum: "$lessonsCompleted" },
            exercisesCompleted: { $sum: "$exercisesCompleted" }
        };

        if (period === 'week') {
            groupCondition._id = { $dayOfYear: "$date" }; // Use day of the year for weekly stats
        } else if (period === 'year') {
            groupCondition._id = { $month: "$date" }; // Use month for yearly stats
        }

        const analytics = await UserAnalytics.aggregate([
            { $match: matchCondition },
            { $group: groupCondition },
            { $sort: { "_id": 1 } } // Sort by _id, which is the grouping field
        ]);

        res.json(analytics);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Update existing analytics data or create new if not found
export const updateUserAnalytics = async (req: updateUserAnalyticsRequest, res: Response) => {
    const { userId } = req.params;
    const { date, totalTimeSpent, coursesTimeSpent, lessonsTimeSpent, exercisesTimeSpent, coursesCompleted, lessonsCompleted, exercisesCompleted } = req.body;
    // if (!userId || !date || !totalTimeSpent || !coursesTimeSpent || !lessonsTimeSpent || !exercisesTimeSpent || !coursesCompleted || !lessonsCompleted || !exercisesCompleted) return res.status(400).json({ ...constResponse.missing })
    if (!isValidObjectId(userId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid userid' })
    try {
        const queryDate = new Date(date);
        const existingAnalytics = await UserAnalytics.findOne({ userId, date: queryDate });

        if (existingAnalytics) {
            // Update existing record
            existingAnalytics.totalTimeSpent += totalTimeSpent;
            existingAnalytics.coursesTimeSpent += coursesTimeSpent;
            existingAnalytics.lessonsTimeSpent += lessonsTimeSpent;
            existingAnalytics.exercisesTimeSpent += exercisesTimeSpent;
            existingAnalytics.coursesCompleted += coursesCompleted;
            existingAnalytics.lessonsCompleted += lessonsCompleted;
            existingAnalytics.exercisesCompleted += exercisesCompleted;

            const updatedAnalytics = await existingAnalytics.save();
            return res.json(updatedAnalytics);
        } else {
            // Create new record
            const newAnalytics = new UserAnalytics({
                userId,
                date: queryDate,
                totalTimeSpent,
                coursesTimeSpent,
                lessonsTimeSpent,
                exercisesTimeSpent,
                coursesCompleted,
                lessonsCompleted,
                exercisesCompleted,
                month: queryDate.getMonth() + 1,
                year: queryDate.getFullYear()
            });

            const savedAnalytics = await newAnalytics.save();
            return res.status(201).json(savedAnalytics);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete analytics data
export const deleteUserAnalytics = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const deletedAnalytics = await UserAnalytics.findByIdAndDelete(userId);

        if (!deletedAnalytics) {
            return res.status(404).json({ error: 'Analytics data not found' });
        }

        res.json({ message: 'Analytics data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};