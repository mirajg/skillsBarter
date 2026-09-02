
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    courseCategory: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String, // cloudinary URL
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);