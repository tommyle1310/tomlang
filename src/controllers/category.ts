import { Request, Response } from "express"
import { registerRequest, updatePasswordRequest } from "../@types/request/user"
import { constResponse } from "../utils/constants/commonMessages"
import User from "../models/User"
import { JWT_SECRET } from "../utils/env"
import jwt from 'jsonwebtoken'
import Category from "../models/Category"
import { isValidObjectId, ObjectId } from "mongoose"

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

export interface editCategoryRequest extends Request {
    body: {
        title: string, categoryId: ObjectId, tags: string[]
    }
}

export const editCategory = async (req: editCategoryRequest, res: Response) => {
    try {
        const { title, tags, categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({ message: 'categoryId is required.' });
        }

        if (!isValidObjectId(categoryId)) {
            return res.status(422).json(constResponse.invalid);
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ ...constResponse.notfound, message: 'Category not found' });
        }

        if (title) {
            category.title = title;
        }

        if (Array.isArray(tags)) {
            // Filter out empty strings from tags
            const filteredTags = tags.filter(tag => tag.trim() !== '');

            if (filteredTags.length > 0) {
                // Use $addToSet with $each to handle multiple tags and avoid duplicates
                category.tags = [...new Set([...category.tags, ...filteredTags])];
            }
        }

        const updatedCategory = await category.save(); // Save the updated category

        return res.json({ ...constResponse.ok, updatedCategory });
    } catch (e: any) {
        if (e.name === 'MongoServerError' && e.code === 11000) {
            // Handle duplicate key error
            return res.status(422).json({ message: 'Category title must be unique.' });
        } else {
            // Handle other errors
            console.error(e);
            return res.status(500).json({ ...constResponse.unknown, message: 'An error occurred while updating the category.' });
        }
    }
};

export const getAllCategories = async (req: Request, res: Response) => {
    const languages = await Category.find()
    return res.json({ ...constResponse.ok, data: languages })
}