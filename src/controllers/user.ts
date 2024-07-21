import { Request, Response } from "express"
import { constResponse } from "../utils/constants/commonMessages"
import mongoose, { isValidObjectId, ObjectId } from "mongoose"
import User from "../models/User"


export const getUserProfile = async (req: Request, res: Response) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) return res.status(422).json({ ...constResponse.invalid, message: 'Invalid userId' })
    const user = await User.findById(userId)
    if (!user) {
        return res.status(422).json({ ...constResponse.notfound, message: 'Cannot find this course.' })
    }
    return res.json({ ...constResponse.ok, user })
}