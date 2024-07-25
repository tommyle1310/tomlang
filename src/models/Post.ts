import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    author: ObjectId;
    images: { key: string, url: string }[]; // Array of image URLs
    videos: { key: string, url: string }[]; // Array of video URLs
    createdAt: Date;
}

const PostSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: { type: [{ key: String, url: String }], default: [] },
    videos: { type: [{ key: String, url: String }], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPost>('Post', PostSchema);
