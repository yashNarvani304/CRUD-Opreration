import dotenv from "dotenv";
dotenv.config()
import nodemailer from "nodemailer";


let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

/*EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USER = 'yash1narvani.grabthesite@gmail.com'
EMAIL_PASS = 'Yash@123'
EMAIL_FROM = 'yash1narvani.grabthesite@gmail.com'*/

// console.log(transporter)

export default transporter