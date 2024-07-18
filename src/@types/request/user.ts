import { Request } from "express";

export interface registerRequest extends Request {
    body: { name: string, email: string, password: string, profilePic: string, age: string }
}
export interface sendEmailVerificationRequest extends Request {
    body: { userId: string }
}
export interface verificationEmailRequest extends Request {
    body: { userId: string, token: string }
}
export interface sendPasswordResetRequest extends Request {
    body: { email: string }
}
export interface updatePasswordRequest extends Request {
    body: { userId: string, password: string }
}