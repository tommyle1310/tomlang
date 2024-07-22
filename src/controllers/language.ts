import { Request, Response } from "express"
import { registerRequest, updatePasswordRequest } from "../@types/request/user"
import { constResponse } from "../utils/constants/commonMessages"
import cloudinary from "../cloud";
import Language from "../models/Language"
import { IncomingForm } from 'formidable';


export const addLanguage = async (req: Request, res: Response) => {
    try {
        const { name, flag } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Language name is required.' });
        }

        // Check if the language already exists
        const existingLanguage = await Language.findOne({ name });
        if (existingLanguage) {
            return res.status(422).json({ message: 'Language name must be unique.' });
        }

        // Create and save the new language
        const newLanguage = new Language({ name, flag });
        await newLanguage.save();

        return res.json({ ...constResponse.ok });
    } catch (e: any) {
        if (e.name === 'MongoServerError' && e.code === 11000) {
            // Handle duplicate key error
            return res.status(422).json({ message: 'Language name must be unique.' });
        } else {
            // Handle other errors
            console.error(e);
            return res.status(500).json({ message: 'An error occurred while adding the language.' });
        }
    }
};

export const updateLanguage = async (req: Request, res: Response) => {
    try {
        const form = new IncomingForm()
        const { languageId } = req.params;
        const { name, flag } = req.body;

        // Check if a language with the new name already exists
        const existingLanguageWithName = await Language.findOne({ name });
        if (existingLanguageWithName && existingLanguageWithName._id.toString() !== languageId) {
            return res.status(422).json({ ...constResponse.duplicated, message: 'Language name must be unique.' });
        }
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ message: 'Error parsing form data' });
            }


            const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;

            if (!name) {
                return res.status(400).json({ ...constResponse.missing, message: 'Language name is required.' });
            }

            const existingLanguage = await Language.findOne({ name });
            if (existingLanguage && existingLanguage.name !== name) {
                return res.status(422).json({ message: 'A language with this name already exists' });
            }

            const language = await Language.findByIdAndUpdate(
                languageId,
                {
                    name
                },
                { new: true, runValidators: true }
            );

            if (!language) {
                return res.status(404).json({ message: 'Language not found' });
            }

            const posterImg = files.flag && (Array.isArray(files.flag) ? files.flag[0] : files.flag);
            if (posterImg) {
                if (language.flag?.key) {
                    try {
                        await cloudinary.uploader.destroy(language.flag.key);
                    } catch (err) {
                        console.error('Error deleting poster from Cloudinary:', err);
                    }
                }

                try {
                    const imgRes = await cloudinary.uploader.upload(posterImg.filepath, {
                        width: 300, height: 300,
                        crop: 'thumb', gravity: 'face'
                    });

                    language.flag = { url: imgRes.secure_url, key: imgRes.public_id };
                    await language.save();
                } catch (err) {
                    console.error('Error uploading new poster to Cloudinary:', err);
                    return res.status(500).json({ message: 'Failed to upload new poster image.' });
                }
            }

            return res.json({ ...constResponse.ok });
        });
    } catch (e: any) {
        if (e.name === 'MongoServerError' && e.code === 11000) {
            // Handle duplicate key error
            return res.status(422).json({ message: 'Language name must be unique.' });
        } else {
            // Handle other errors
            console.error(e);
            return res.status(500).json({ message: 'An error occurred while updating the language.' });
        }
    }
};


export const getAllLanguages = async (req: Request, res: Response) => {
    const languages = await Language.find()
    return res.json({ ...constResponse.ok, data: languages })
}