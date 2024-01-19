import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import cors from 'cors';
import connectDB from "./config/db.config.js";
import userRoutes from "./routes/userRouter.js"
const app = express();
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL




//JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// CORS policy
app.use(cors());

//Database Connection
connectDB(DATABASE_URL)

//load routes
app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
});
