import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    content: string;
    author: ObjectId;
    images: { key: string, url: string }[]; // Array of image URLs
    videos: { key: string, url: string }[]; // Array of video URLs
    createdAt: Date;
}

const CommentSchema: Schema = new Schema({
    postId: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: { type: [{ key: String, url: String }], default: [] },
    videos: { type: [{ key: String, url: String }], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IComment>('Comment', CommentSchema);
