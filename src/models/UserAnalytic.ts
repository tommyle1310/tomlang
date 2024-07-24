import { ObjectId } from "mongoose";

// models/UserAnalytics.js
const mongoose = require('mongoose');

const UserAnalyticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },

    // Total time spent in minutes
    totalTimeSpent: { type: Number, default: 0 }, // Total time spent on the platform

    // Time spent on courses
    coursesTimeSpent: { type: Number, default: 0 }, // Total time spent on courses
    lessonsTimeSpent: { type: Number, default: 0 }, // Total time spent on lessons
    exercisesTimeSpent: { type: Number, default: 0 }, // Total time spent on exercises

    // Number of items completed
    coursesCompleted: { type: Number, default: 0 }, // Number of courses completed
    lessonsCompleted: { type: Number, default: 0 }, // Number of lessons completed
    exercisesCompleted: { type: Number, default: 0 }, // Number of exercises completed

    // Monthly statistics
    month: { type: Number, required: true }, // Month of the year (1-12)
    year: { type: Number, required: true }, // Year
});

// Static method to aggregate monthly statistics
UserAnalyticsSchema.statics.aggregateMonthlyStats = function (userId: ObjectId, year: number, month: number) {
    return this.aggregate([
        { $match: { userId: userId, year: year, month: month } },
        {
            $group: {
                _id: null,
                totalTimeSpent: { $sum: '$totalTimeSpent' },
                coursesTimeSpent: { $sum: '$coursesTimeSpent' },
                lessonsTimeSpent: { $sum: '$lessonsTimeSpent' },
                exercisesTimeSpent: { $sum: '$exercisesTimeSpent' },
                coursesCompleted: { $sum: '$coursesCompleted' },
                lessonsCompleted: { $sum: '$lessonsCompleted' },
                exercisesCompleted: { $sum: '$exercisesCompleted' },
            }
        }
    ]);
};

const UserAnalytics = mongoose.model('UserAnalytics', UserAnalyticsSchema);
export default UserAnalytics;
