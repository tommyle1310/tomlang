import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';
import MarkdownIt from 'markdown-it';

// Markdown-It setup
const md = new MarkdownIt();

// Define the schema for the course
export interface ICourse extends Document {
    title: string;
    _id: ObjectId;
    description: string;
    content: string; // Markdown content
    exercises: IExercise[];
    recommendations: mongoose.Types.ObjectId[];
    author: string;
    likes: number;
    price: number;
    poster: { url: string, key: string };
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    categories: string[];
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

export interface IExercise {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

export interface IReview {
    student: string;
    review: string;
    rating: number;
    date: Date;
}

const ExerciseSchema: Schema<IExercise> = new Schema({
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String
        }
    ],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String
    }
});

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
    content: {
        type: String,
        required: true // Markdown content
    },
    exercises: [ExerciseSchema],
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
        // required: true
    },
    categories: [
        {
            type: String
        }
    ],
    language: {
        type: Schema.Types.ObjectId,
        ref: 'Language', // Reference to Language model
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
