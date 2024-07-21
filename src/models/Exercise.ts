import { Schema, model, ObjectId, Model, Document } from 'mongoose';

// Define the TypeScript interface
export interface ExerciseDocument extends Document {
    title: string;
    fromLesson?: ObjectId;
    correctAnswer: number;
    explanation: string;
    options: string[];
    question: string;
    answerCount: number; // Total number of attempts
}

// Define the schema
const exerciseSchema = new Schema<ExerciseDocument>({
    title: {
        type: String,
        required: true
    },
    fromLesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    correctAnswer: {
        type: Number,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    question: {
        type: String,
        required: true
    },
    answerCount: {
        type: Number,
        default: 0 // Total number of attempts
    }
}, {
    timestamps: true
});

// Create and export the model
export default model<ExerciseDocument>('Exercise', exerciseSchema);
