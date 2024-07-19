import { Request, Response } from "express"
import { registerRequest, updatePasswordRequest } from "../@types/request/user"
import { constResponse } from "../utils/constants/commonMessages"
import User from "../models/User"
import { JWT_SECRET } from "../utils/env"
import jwt from 'jsonwebtoken'
import Language from "../models/Language"

export const addLanguage = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Language name is required.' });
        }

        // Check if the language already exists
        const existingLanguage = await Language.findOne({ name });
        if (existingLanguage) {
            return res.status(422).json({ message: 'Language name must be unique.' });
        }

        // Create and save the new language
        const newLanguage = new Language({ name });
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


export const getAllLanguages = async (req: Request, res: Response) => {
    const languages = await Language.find()
    return res.json({ ...constResponse.ok, data: languages })
}