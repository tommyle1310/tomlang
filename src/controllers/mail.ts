import { Response } from "express"
import { sendEmailVerificationRequest, sendPasswordResetRequest, verificationEmailRequest } from "../@types/request/user"
import { isValidObjectId } from "mongoose"
import { constResponse } from "../utils/constants/commonMessages"
import User from "../models/User"
import VerificationEmail from "../models/VerificationEmail"
import { generateToken } from "../utils/helper"
import crypto from "crypto"
import { sendVerificationMail, sendResetPassword } from "../utils/mail"
import ResetPassword from "../models/ResetPassword"
import { PASSWORD_RESET_LINK } from "../utils/env"

export const sendEmailVerification = async (req: sendEmailVerificationRequest, res: Response) => {
    const { userId } = req.body

    if (!isValidObjectId(userId)) return res.status(402).json(constResponse.invalid)

    const user = await User.findById(userId)
    if (!user) return res.status(403).json(constResponse.notfound)

    await VerificationEmail.findOneAndDelete({
        owner: userId
    })

    const token = await generateToken()
    VerificationEmail.create({
        owner: userId,
        token
    })
    console.log('user:', user);

    sendVerificationMail(token, { name: user?.name, email: user.email, userId: user?._id.toString() })
    res.json({ message: "Verification code has been sent to your mail." })
}

export const verifyEmail = async (req: verificationEmailRequest, res: Response) => {
    const { token, userId } = req.body
    const verificationToken = await VerificationEmail.findOne({
        owner: userId
    })

    if (!verificationToken) return res.status(403).json(constResponse.notfound)
    const matched = await verificationToken.compareToken(token)

    if (!matched) return res.status(403).json(constResponse.invalid)

    await User.findByIdAndUpdate(userId, {
        verified: true
    })

    await VerificationEmail.findByIdAndDelete(verificationToken._id)
    res.json(constResponse.ok)
}

export const sendResetPasswordMail = async (req: sendPasswordResetRequest, res: Response) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: "Account not found!!" })
    const token = crypto.randomBytes(36).toString('hex')

    await ResetPassword.findOneAndDelete({ owner: user._id })
    ResetPassword.create({
        owner: user._id,
        token
    })
    const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`
    sendResetPassword({ email: user?.email, link: resetLink, name: user?.name })

    res.json({ ...constResponse.ok, message: 'Your reset password request has been sent to your mail.' })
}
