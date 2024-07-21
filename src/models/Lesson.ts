import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';
import LessonContent, { ILessonContent } from './LessonContent';

// Define the schema for the lesson
export interface ILesson extends Document {
    title: string;
    content: ObjectId[]; // Array of LessonContent references
    exercises?: ObjectId[]; // Array of LessonContent references
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema: Schema<ILesson> = new Schema({
    title: {
        type: String,
        required: true
    },
    content: [
        {
            type: Schema.Types.ObjectId,
            ref: 'LessonContent',
            required: true
        }
    ],
    exercises: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Exercise',
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

LessonSchema.pre<ILesson>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', LessonSchema);

export default Lesson;
