
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    commentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String, 
        required: true,
        trim: true,
        maxlength: 500,
    },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);