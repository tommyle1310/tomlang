import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';

interface ILanguage extends Document {
    _id: ObjectId
    name: string; // The name of the language, e.g., 'English', 'Spanish'
    flag: {
        url: string
        key: string
    }
}

const LanguageSchema: Schema<ILanguage> = new Schema({
    name: {
        type: String,
        required: true,
    },
    flag: {
        url: String,
        key: String
    }
});

const Language: Model<ILanguage> = mongoose.model<ILanguage>('Language', LanguageSchema);

export default Language;
