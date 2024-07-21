import { Schema, model, Document, ObjectId } from 'mongoose';

interface UserResponseDocument extends Document {
    userId: ObjectId;
    exerciseId: ObjectId;
    selectedOptionIndex: number;
    isCorrect: boolean;
    answerTime: number; // Time in milliseconds
    attempt: number;
}

const userResponseSchema = new Schema<UserResponseDocument>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    exerciseId: { type: Schema.Types.ObjectId, required: true, ref: 'Exercise' },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    answerTime: { type: Number, required: true },
    attempt: { type: Number, default: 1 },
}, {
    timestamps: true
});

export default model<UserResponseDocument>('UserResponse', userResponseSchema);
