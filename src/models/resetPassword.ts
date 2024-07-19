import { Model, ObjectId, Schema, model } from "mongoose"
import { hash, compare } from "bcrypt"

interface resetPasswordDocument {
    owner: ObjectId
    token: string
    createdAt: Date
}

interface Methods {
    compareToken(token: string): Promise<boolean>
}

const resetPasswordSchema = new Schema<resetPasswordDocument, {}, Methods>({
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
})

resetPasswordSchema.pre('save', async function (next) {
    if (this.isModified('token')) {
        this.token = await hash(this.token, 10)
    }
    next()
})

resetPasswordSchema.methods.compareToken = async function (token) {
    const result = await compare(token, this.token)
    return result
}

export default model('ResetPassword', resetPasswordSchema) as Model<resetPasswordDocument, {}, Methods>