import mongoose, { Document, Schema, Model } from 'mongoose';

interface ILanguage extends Document {
    name: string; // The name of the language, e.g., 'English', 'Spanish'
}

const LanguageSchema: Schema<ILanguage> = new Schema({
    name: {
        type: String,
        required: true,
    }
});

const Language: Model<ILanguage> = mongoose.model<ILanguage>('Language', LanguageSchema);

export default Language;
