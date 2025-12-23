import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL).then(()=>console.log("DB Connected"));
}