import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';
// import { log } from 'console';

var checkUser = async (req, res, next) => {
    let token
    const { authorization } = req.headers
    console.log(authorization)

    if (authorization && authorization.startsWith('Bearer')) {
        
        try {
            token = authorization.split(' ')[1];
            console.log(token);
            //verify the token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // console.log(userID);
            //get token from user
            req.user = await userModel.findById(userID).select('-password');

            next()
            // res.status(401).send({ "status": "failed", "message": "authorized user" })
        } catch (error) {

            res.status(401).send({ "status": "failed", "message": "Unautorized user" })

        }
    }
    if (!token) {
        res.status(401).send({ "status": "failed", "message": "Unautorized user who has not token" })
    }
}

const midd = (err, req, res, next) => {

}

export default checkUser