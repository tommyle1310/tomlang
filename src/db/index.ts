import mongoose from 'mongoose'
import { MONGO_URI } from '../utils/env'
const URI = MONGO_URI

mongoose.set('strictQuery', true)
mongoose.connect(URI)
    .then(() => {
        console.log('db is connected')
    }).catch((e) => {
        console.log('db connection failed', e)
    })