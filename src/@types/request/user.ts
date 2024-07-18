import { Request } from "express";

export interface registerRequest extends Request {
    body: { name: string, email: string, password: string, profilePic: string, age: string }
}