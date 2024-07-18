import express from 'express'
import { sendEmailVerification, sendResetPasswordMail, verifyEmail } from '../controllers/mail'
import { updatePassword } from '../controllers/auth'

const router = express.Router();


// send email verification
router.post('/send-email-verification', sendEmailVerification)

router.post('/verify-email', verifyEmail)

router.post('/send-reset-password', sendResetPasswordMail)

router.post('/update-password', updatePassword)

export default router;
