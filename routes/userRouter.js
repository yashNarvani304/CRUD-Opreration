import express from 'express'
const router = express.Router();
import UserController from "../controllers/userController.js"
import checkUser from '../middleware/authmiddleware.js';

//ROutes level middleware
// router.use('/changepassword', checkUser)
router.use('/loggeduser', checkUser)
//public routes
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/forget', UserController.forget)
router.post('/reset-password/:id/:token', UserController.userpasswordreset)
//protected Routes
router.post('/changepassword', checkUser, UserController.changepassword)
router.get('/loggeduser', UserController.logedIn)

export default router

