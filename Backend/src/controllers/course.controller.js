
import { cloudinary } from "../config/connectCloudinary.js";
import multer from "multer";
import Course from "../models/course.model.js";
import Comment from "../models/comment.model.js";
import { User } from "../models/user.model.js"
import { sendMail } from "../utils/SendMail.js"


const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit enforced on backend too
});

export const createCourse = async (req, res) => {
    try {

        const userId = req.user._id;
        const { title, description, category } = req.body;

        // validation
        if (!title?.trim()) return res.status(400).json({ message: "Title is required." });
        if (title.trim().length > 80) return res.status(400).json({ message: "Title too long." });
        if (!description?.trim()) return res.status(400).json({ message: "Description is required." });
        if (!category?.trim()) return res.status(400).json({ message: "Category is required." });
        if (description.trim().length > 1000) return res.status(400).json({ message: "Description too long." });
        if (!req.file) return res.status(400).json({ message: "Service image is required." });

        // upload image to cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "service_images",
                    transformation: [
                        { width: 800, height: 500, crop: "fill" },
                        { quality: "auto" },
                        { fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const courseCreation = await Course.create({
            user: userId,
            title: title.trim(),
            description: description.trim(),
            image: result.secure_url,
            courseCategory: category,
        });

        return res.status(201).json({
            message: "Course created.",
            courseCreation,
        });

    } catch (err) {
        console.error("createCourse error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        return res.status(200).json({ courses });
    } catch (err) {
        console.error("getCourses error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const requestCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const senderId = req.user._id;

        if (!courseId) {
            return res.status(400).json({ message: "courseId is required." });
        }

        const course = await Course.findById(courseId).populate("user", "email name");
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const sender = await User.findById(senderId).select("name email");
        if (!sender) {
            return res.status(404).json({ message: "Requesting user not found." });
        }

        if (course.user.email === sender.email) {
            return res.status(400).json({ message: "You can't request your own course." });
        }

        const to = course.user.email;
        const subject = `New learning request: ${course.title}`;
        const message = `${sender.name} (${sender.email}) wants to learn "${course.title}" from you.\n\nDescription: ${course.description}`;

        await sendMail(to, subject, message);

        return res.status(200).json({ message: "Request sent successfully." });

    } catch (err) {
        console.error("requestCourse error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const storeComment = async (req, res) => {
    try {
        const courseId = req.params.id;
        const commentUser = req.user._id;
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ message: "Comment text is required." });
        }
        if (text.trim().length > 500) {
            return res.status(400).json({ message: "Comment is too long." });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const comment = await Comment.create({
            course: courseId,
            commentUser,
            text: text.trim(),
        });

        const populatedComment = await comment.populate("commentUser", "name");

        return res.status(201).json({
            message: "Comment posted.",
            comment: populatedComment,
        });

    } catch (err) {
        console.error("storeComment error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getComments = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const comments = await Comment.find({ course: courseId })
            .populate("commentUser", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Comments fetched.",
            comments,
        });

    } catch (err) {
        console.error("getComments error:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};