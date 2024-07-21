import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';
import MarkdownIt from 'markdown-it';

// Markdown-It setup
const md = new MarkdownIt();

// Define the schema for the course
export interface ICourse extends Document {
    title: string;
    _id: ObjectId;
    description: string;
    lessons: mongoose.Types.ObjectId[]; // References to Lesson model
    exercises: mongoose.Types.ObjectId[];
    recommendations: mongoose.Types.ObjectId[];
    author: string;
    likes: number;
    price: number;
    poster: { url: string, key: string };
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    categories: ObjectId[];
    language: mongoose.Types.ObjectId; // Reference to Language model
    enrollmentCount: number;
    rating: number;
    reviews: IReview[];
    publishDate: Date;
    lastUpdated: Date;
    resources: { title: string; url: string }[];
    prerequisites: string[]; // Tags from Category schema
    createdAt: Date;
    updatedAt: Date;
}



export interface IReview {
    student: string;
    review: string;
    rating: number;
    date: Date;
}


const ReviewSchema: Schema<IReview> = new Schema({
    student: String,
    review: String,
    rating: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const CourseSchema: Schema<ICourse> = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    lessons: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Lesson'
        }
    ],
    exercises: [{
        type: Schema.Types.ObjectId,
        ref: 'Exercise'
    }],
    recommendations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    author: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    poster: {
        url: {
            type: String,
            required: true
        },
        key: {
            type: String,
            required: true
        }
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    duration: {
        type: String
    },
    categories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        }
    ],
    language: {
        type: Schema.Types.ObjectId,
        ref: 'Language',
        required: true
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [ReviewSchema],
    publishDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    resources: [
        {
            title: String,
            url: String
        }
    ],
    prerequisites: [
        {
            type: String
        }
    ], // Tags from Category schema
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

CourseSchema.pre<ICourse>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
