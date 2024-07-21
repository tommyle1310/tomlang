import { Request, Response } from "express"
import { registerRequest, updatePasswordRequest } from "../@types/request/user"
import { constResponse } from "../utils/constants/commonMessages"
import User from "../models/User"
import { JWT_SECRET } from "../utils/env"
import jwt from 'jsonwebtoken'
import ResetPassword from "../models/ResetPassword"
import { sendResetPasswordSuccess } from "../utils/mail"

export const register = async (req: registerRequest, res: Response) => {
    const { age, email, name, password, profilePic } = req.body
    if (!name || !password) {
        return res.status(404).json(constResponse.missing)
    }
    const userExistingEmail = await User.findOne({ email })
    const userExistingName = await User.findOne({ name })
    if (userExistingName || userExistingEmail) {
        return res.status(422).json({ ...constResponse.duplicated, message: 'Email and name must be unique.' })
    }
    const newUser = new User({
        email,
        name,
        password, profilePic, age, verified: false
    })
    await newUser.save()
    return res.json(constResponse.ok)
}

export const login = async (req: Request, res: Response) => {
    const { name, password } = req.body
    if (!name || !password) {
        return res.status(404).json(constResponse.missing)
    }
    const user = await User.findOne({ name })
    if (!user) return res.status(404).json({ ...constResponse.notfound, message: `Not found user with the name: '${name}'` })
    const matched = await user.comparePassword(password)
    if (!matched) return res.status(403).json({ ...constResponse.invalid, error: 'Email/password mismatch!!' })
    const token = await jwt.sign({ userId: user._id }, JWT_SECRET)
    user.tokens.push(token)
    await user.save()
    return res.json({ ...constResponse.ok, user })
}

export const updatePassword = async (req: updatePasswordRequest, res: Response) => {
    const { password, userId } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(403).json({ error: 'Unauthorized access!!' })
    const match = await user.comparePassword(password)
    if (match) return res.status(403).json({ error: 'The new password must be different!!' })
    user.password = password
    await user.save()
    await ResetPassword.findOneAndDelete({ owner: user._id })
    sendResetPasswordSuccess({ email: user.email, name: user.name })
    res.json({ ...constResponse.ok, message: "Password reset successfully" })
}