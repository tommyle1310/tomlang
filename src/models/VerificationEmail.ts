import { Model, ObjectId, Schema, model } from "mongoose"
import { hash, compare } from "bcrypt"

interface verificationEmailDocument {
    owner: ObjectId
    token: string
    createdAt: Date
}

interface Methods {
    compareToken(token: string): Promise<boolean>
}

const verificationEmailSchema = new Schema<verificationEmailDocument, {}, Methods>({
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

verificationEmailSchema.pre('save', async function (next) {
    if (this.isModified('token')) {
        this.token = await hash(this.token, 10)
    }
    next()
})

verificationEmailSchema.methods.compareToken = async function (token) {
    const result = await compare(token, this.token)
    return result
}

export default model('VerificationEmail', verificationEmailSchema) as Model<verificationEmailDocument, {}, Methods>