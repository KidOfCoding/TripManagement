import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID - Scoped uniqueness
        required: true,
        unique: true // One counter doc per user
    },
    seq: {
        type: Number,
        default: 0
    }
});

export default mongoose.model("Counter", counterSchema);
