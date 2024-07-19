import { Request, Response } from "express"
import { registerRequest, updatePasswordRequest } from "../@types/request/user"
import { constResponse } from "../utils/constants/commonMessages"
import User from "../models/User"
import { JWT_SECRET } from "../utils/env"
import jwt from 'jsonwebtoken'
import Category from "../models/Category"

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { title, tags } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Category title is required.' });
        }

        if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) {
            return res.status(400).json({ message: 'Tags must be an array of strings.' });
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ title });
        if (existingCategory) {
            return res.status(422).json({ message: 'Category title must be unique.' });
        }

        // Create and save the new category
        const newCategory = new Category({ title, tags });
        await newCategory.save();

        return res.json(constResponse.ok);
    } catch (e: any) {
        if (e.name === 'MongoServerError' && e.code === 11000) {
            // Handle duplicate key error
            return res.status(422).json({ message: 'Category title must be unique.' });
        } else {
            // Handle other errors
            console.error(e);
            return res.status(500).json({ message: 'An error occurred while adding the category.' });
        }
    }
};



export const getAllCategories = async (req: Request, res: Response) => {
    const languages = await Category.find()
    return res.json({ ...constResponse.ok, data: languages })
}