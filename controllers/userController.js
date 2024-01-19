import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { CLIENT_RENEG_LIMIT } from "tls";
import transporter from "../config/email.config.js";


var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
// var emailRegex = "/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/"
const nameRegex = /^[A-Za-z\s'-]+$/

class UserController {
    static userRegistration = async (req, res) => {
        console.log(req.body);
        const { name, email, password, confirm_password } = req.body;
        const user = await userModel.findOne({ email: email });
        if (user) {
            res.send({ "status": "failed", "message": "Email already registered" })
        } else {

            if (name && email && password && confirm_password) {
                if (!email.match(emailRegex)) {
                    return res.status(400).json({ message: 'Invalid email format' });
                }
                else if (!name.match(nameRegex)) {
                    return res.send({ "status": "failed", "message": "Invalid Name format" });
                }
                if (password === confirm_password) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const doc = new userModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            confirm_password: hashPassword
                        })

                        console.log("docs:", doc);
                        await doc.save()
                        //generate jwt token

                        const saved_user = await userModel.findOne({ email: email })
                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.send({ "status": "success", "message": "registration compelete", 'token': token })
                    }
                    catch (error) {
                        console.log(error)
                        res.send({ "status": "failed", "message": "Unable to registration" })
                    }
                }
                else {
                    res.send({ "status": "failed", "message": "dosent match password" })
                }


            }
            else {
                res.send({ "status": " failed", "message": "plz fill the all the details" })
            }
        }
    }

    //login
    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                if (!email.match(emailRegex)) {
                    return res.send({ "status": "failed", "message": "Invalid email format" });
                }
                const user = await userModel.findOne({ email: email })
                if (user != null) {
                    const imatch = await bcrypt.compare(password, user.password)
                    if (user.email === email && imatch) {
                        //jwt token 
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
                        res.send({ "status": "success", "message": "Login successful", "token": token })
                    }
                    else {
                        res.send({ "status": "failed", "message": "Email or password is not valid" })
                    }
                }
                else {
                    res.send({ "status": "failed", "message": "You are not registerd user" })
                }
            }
            else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }
        } catch (error) {
            res.send({ "status": "failed", "message": "error" })
            console.error(error)
        }
    }
//change password
    static changepassword = async (req, res) => {
        const { password, confirm_password } = req.body
        //verify that pass word and confirm password are same
        if (password, confirm_password) {
            if (confirm_password !== password) {
                res.send({ "status": "failed", "message": "New Password and Confirm password do not match" })
            }
            else {
                //hashing
                const salt = await bcrypt.genSalt(10)
                const newhashPassword = await bcrypt.hash(password, salt)
                //update
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newhashPassword } })
                res.send({ "status": "success", "message": "Password changed successfully" })
            }
        } else {
            res.send({ success: false, "status": "failed", "message": "feilds required" })

        }

    }

    static logedIn = async (req, res) => {
        res.send({ "user": req.user })
    }

    static forget = async (req, res) => {
        const { email } = req.body
        if (email) {
            if (!email.match(emailRegex)) {
                return res.send({ "status": "failed", "message": "Invalid email format" });
            }
            const user = await userModel.findOne({ email: email })

            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userID: user._id }, secret, {
                    expiresIn: "25m"
                })
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`

                // console.log(link)

                //send Email
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "GeekShop - Password Reset",
                    html: `<a href=${link}>click here</a>to reset your password`

                })
                res.send({ "status": "success", "message": "Sent link in ur EMail" })
            }
            else {
                res.send({ "status": "failed", "message": "Email doesn't exists" })
            }
        }
        else {
            res.send({ "status": "failed", "message": "Email is required" })
        }
    }

    static userpasswordreset = async (req, res) => {
        const { password, confirm_password } = req.body
        const { id, token } = req.params
        // console.log(req.body)
        const user = await userModel.findById(id)
        console.log("userID")
        console.log(user)
        const new_secret = process.env.JWT_SECRET_KEY
        console.log(new_secret)
        try {
            jwt.verify(token, new_secret)
            if (password && confirm_password) {
                if (password !== confirm_password) {
                    res.send({ "status": "failed", "message": "Plz fill all the details" })
                }
                else {
                    const salt = await bcrypt.genSalt(10)
                    const newhashPassword = await bcrypt.hash(password, salt)
                    await userModel.findByIdAndUpdate(user._id, { $set: { password: newhashPassword } })
                    res.send({ "status": "success", "message": "Password changed successfully" })

                }

            }
            else {
                res.send({ "status": "failed", "message": "Plz fill all the details" })
            }
        } catch (error) {
            console.error(error)
            res.send({ "status": "failed", "message": error })
        }
    }
}

export default UserController