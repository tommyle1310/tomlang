import nodemailer from 'nodemailer'
import { MAILTRAP_PASSWORD, MAILTRAP_USER, RESET_PASSWORD_EMAIL, TOMLANG_EMAIL, VERIFICATION_EMAIL } from './env'
import { generateTemplateEmail } from './mail/template';
import path from 'path'

interface IProfile {
    name: string
    email: string
    userId: string
}
export const sendVerificationMail = async (token: string, profile: IProfile) => {
    const transport = generateMailTransporter()

    const { name, email, userId } = profile


    const message = `Hi ${name}, welcome to Tomlang. There are so much thing that we do for verified users. Use this OTP to verify your email.`
    console.log('email: ', email);

    transport.sendMail({
        to: email,
        from: VERIFICATION_EMAIL,
        subject: "Verify your email",
        html: generateTemplateEmail({
            title: "Welcome to Tomlang",
            message: message,
            logo: 'cid:logo',
            logoPlain: 'cid:logoPlain',
            banner: 'cid:welcome',
            link: '#',
            btnTitle: token,
            facebook: {
                img: 'cid:facebook', link: 'https://www.facebook.com'
            },
            instagram: {
                img: 'cid:instagram', link: 'https://www.instagram.com'
            },
            twitter: {
                img: 'cid:twitter', link: 'https://www.twitter.com'
            },
            linkedIn: {
                img: 'cid:linkedIn', link: 'https://www.linkedIn.com'
            },
        }),
        attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, './mail/images/logo.png'),
                cid: 'logo'
            },
            {
                filename: 'logoPlain.png',
                path: path.join(__dirname, './mail/images/logo-plain.png'),
                cid: 'logoPlain'
            },
            {
                filename: 'welcome.png',
                path: path.join(__dirname, './mail/images/___passwordreset.gif'),
                cid: 'welcome'
            },
            {
                filename: 'facebook.png',
                path: path.join(__dirname, './mail/images/facebook2x.png'),
                cid: 'facebook'
            },
            {
                filename: 'twitter.png',
                path: path.join(__dirname, './mail/images/twitter2x.png'),
                cid: 'twitter'
            },
            {
                filename: 'linkedIn.png',
                path: path.join(__dirname, './mail/images/linkedIn2x.png'),
                cid: 'linkedIn'
            },
            {
                filename: 'instagram.png',
                path: path.join(__dirname, './mail/images/instagram2x.png'),
                cid: 'instagram'
            },
        ]
    })
}

interface ISendResetPassword {
    email: string,
    name: string,
    link: string
}
export const sendResetPassword = async ({ email, name, link }: ISendResetPassword) => {
    const transport = generateMailTransporter()


    const message = `Hi ${name}, we have received your request to recover your password, follow the link below to reset your password.`

    transport.sendMail({
        to: email,
        from: RESET_PASSWORD_EMAIL,
        subject: "Reset Password",
        html: generateTemplateEmail({
            title: "Recover my password",
            message: message,
            logo: 'cid:logo',
            logoPlain: 'cid:logoPlain',
            banner: 'cid:welcome',
            link,
            btnTitle: 'Reset password',
            facebook: {
                img: 'cid:facebook', link: 'https://www.facebook.com'
            },
            instagram: {
                img: 'cid:instagram', link: 'https://www.instagram.com'
            },
            twitter: {
                img: 'cid:twitter', link: 'https://www.twitter.com'
            },
            linkedIn: {
                img: 'cid:linkedIn', link: 'https://www.linkedIn.com'
            },
        }),
        attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, './mail/images/logo.png'),
                cid: 'logo'
            },
            {
                filename: 'logoPlain.png',
                path: path.join(__dirname, './mail/images/logo-plain.png'),
                cid: 'logoPlain'
            },
            {
                filename: 'welcome.png',
                path: path.join(__dirname, './mail/images/___passwordreset.gif'),
                cid: 'welcome'
            },
            {
                filename: 'facebook.png',
                path: path.join(__dirname, './mail/images/facebook2x.png'),
                cid: 'facebook'
            },
            {
                filename: 'twitter.png',
                path: path.join(__dirname, './mail/images/twitter2x.png'),
                cid: 'twitter'
            },
            {
                filename: 'linkedIn.png',
                path: path.join(__dirname, './mail/images/linkedIn2x.png'),
                cid: 'linkedIn'
            },
            {
                filename: 'instagram.png',
                path: path.join(__dirname, './mail/images/instagram2x.png'),
                cid: 'instagram'
            },
        ]
    })
}
interface ISendResetPasswordSuccess {
    email: string,
    name: string
}
export const sendResetPasswordSuccess = async ({ email, name }: ISendResetPasswordSuccess) => {
    const transport = generateMailTransporter()


    const message = `Hi ${name}, your password has been successfully reset. You can now sign in with your new password.`

    transport.sendMail({
        to: email,
        from: TOMLANG_EMAIL,
        subject: "Reset Password",
        html: generateTemplateEmail({
            title: "Reset password successfully",
            message: message,
            logo: 'cid:logo',
            logoPlain: 'cid:logoPlain',
            banner: 'cid:welcome',
            link: '',
            btnTitle: '',
            facebook: {
                img: 'cid:facebook', link: 'https://www.facebook.com'
            },
            instagram: {
                img: 'cid:instagram', link: 'https://www.instagram.com'
            },
            twitter: {
                img: 'cid:twitter', link: 'https://www.twitter.com'
            },
            linkedIn: {
                img: 'cid:linkedIn', link: 'https://www.linkedIn.com'
            },
        }),
        attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, './mail/images/logo.png'),
                cid: 'logo'
            },
            {
                filename: 'logoPlain.png',
                path: path.join(__dirname, './mail/images/logo-plain.png'),
                cid: 'logoPlain'
            },
            {
                filename: 'welcome.png',
                path: path.join(__dirname, './mail/images/___passwordreset.gif'),
                cid: 'welcome'
            },
            {
                filename: 'facebook.png',
                path: path.join(__dirname, './mail/images/facebook2x.png'),
                cid: 'facebook'
            },
            {
                filename: 'twitter.png',
                path: path.join(__dirname, './mail/images/twitter2x.png'),
                cid: 'twitter'
            },
            {
                filename: 'linkedIn.png',
                path: path.join(__dirname, './mail/images/linkedIn2x.png'),
                cid: 'linkedIn'
            },
            {
                filename: 'instagram.png',
                path: path.join(__dirname, './mail/images/instagram2x.png'),
                cid: 'instagram'
            },
        ]
    })
}

const generateMailTransporter = () => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: MAILTRAP_USER,
            pass: MAILTRAP_PASSWORD
        }
    });
    return transport
}