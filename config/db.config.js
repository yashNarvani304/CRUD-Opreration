import mongoose from 'mongoose';
export const connectDB = async (DATABASE_URL) => {
    try {
        const dba = {
            dbname: "mongoose",
        }
        await mongoose.connect(DATABASE_URL, dba)
        console.log('connected to database')
    } catch (error) {
        console.error(error)
    }
}


export default connectDB;