import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the schema for LessonContent
export interface ILessonContent extends Document {
    content: string; // Markdown string
    createdAt: Date;
    updatedAt: Date;
}

const LessonContentSchema: Schema<ILessonContent> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

LessonContentSchema.pre<ILessonContent>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const LessonContent: Model<ILessonContent> = mongoose.model<ILessonContent>('LessonContent', LessonContentSchema);

export default LessonContent;
