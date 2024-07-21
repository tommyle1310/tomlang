import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';

export interface IExercise {
    question: string;
    options: string[];
    correctAnswer: number; // Updated to Number
    explanation?: string;
    title: string;
    fromLesson?: ObjectId;
}

const ExerciseSchema: Schema<IExercise> = new Schema({
    title: {
        type: String,
        required: true
    },
    fromLesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String
        }
    ],
    correctAnswer: { // Updated to Number
        type: Number,
        required: true
    },
    explanation: {
        type: String
    }
});

const Exercise: Model<IExercise> = mongoose.model<IExercise>('Exercise', ExerciseSchema);

export default Exercise;
