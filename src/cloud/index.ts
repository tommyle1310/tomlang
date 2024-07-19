
import { v2 as cloudinary } from 'cloudinary'
import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET } from '../utils/env'

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRET,
    secure: true
})
export default cloudinary