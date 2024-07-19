import mongoose, { Document, Schema, Model } from 'mongoose';

interface IContent {
    type: 'text' | 'video' | 'image' | 'quiz' | 'interactive';
    data: any; // Use appropriate types for different content types
}

interface IExercise {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

interface IReview {
    student: string;
    review: string;
    rating: number;
    date: Date;
}

interface ICourse extends Document {
    title: string;
    description: string;
    content: IContent[];
    exercises: IExercise[];
    recommendations: mongoose.Types.ObjectId[];
    author: string;
    likes: number;
    price: number;
    poster: { url: string }[];
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

const ContentSchema: Schema<IContent> = new Schema({
    type: {
        type: String,
        enum: ['text', 'video', 'image', 'quiz', 'interactive'],
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    }
});

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
    content: [ContentSchema],
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
    poster: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    duration: {
        type: String,
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
