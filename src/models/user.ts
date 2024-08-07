import { compare, hash } from "bcrypt"
import mongoose, { Model, ObjectId, Schema, model } from "mongoose"

interface PurchasedItem {
    type: string; // Type discriminator
    item: Schema.Types.ObjectId; // Reference to the item
}

export interface userDocument {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    verified: boolean;
    profilePic?: {
        url: string;
        key: string;
    };
    tokens: string[];
    favorites: ObjectId[];
    followers: ObjectId[];
    followings: ObjectId[];
    purchased?: PurchasedItem[];
    age: number;
    progress: {
        exercisesCompleted: {
            exerciseId: ObjectId;
            completed: boolean;
        }[];
        coursesCompleted: {
            courseId: ObjectId; // Reference to the course
            completionPercentage: number; // Percentage of lessons completed (0-100)
            completedLessonIds?: ObjectId[]; // List of completed lesson IDs
        }[];
        lastActive: Date; // Last active timestamp
    };
}


interface Methods {
    comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<userDocument, {}, Methods>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: Object,
        url: String,
        key: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: "Audio"
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    age: Number,
    tokens: [String],
    purchased: [{
        type: {
            type: String,
            enum: ['Course', 'Vip'] // Type discriminator
        },
        item: {
            type: Schema.Types.ObjectId,
            refPath: 'purchased.type' // Dynamic reference path based on type
        }
    }],
    progress: {
        coursesCompleted: [{
            courseId: { type: Schema.Types.ObjectId, ref: 'Course' }, // Reference to the course
            completionPercentage: { type: Number }, // Percentage of lessons completed (0-100)
            completedLessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }] // List of completed lesson IDs
        }],
        exercisesCompleted: [{
            exerciseId: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise'
            },
            completed: { type: Boolean, default: false }
        }],
        lastActive: { type: Date }
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, 10)
    }
    next()
})

userSchema.methods.comparePassword = async function (password) {
    const result = await compare(password, this.password)
    return result
}

export default model('User', userSchema) as Model<userDocument, {}, Methods>