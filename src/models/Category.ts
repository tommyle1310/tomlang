import mongoose, { Document, Schema, Model } from 'mongoose';

interface ICategory extends Document {
    title: string;
    tags: string[]; // List of tags associated with the category
}

const CategorySchema: Schema<ICategory> = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    tags: [
        {
            type: String,
            required: true
        }
    ]
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
