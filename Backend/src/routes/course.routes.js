
import express from "express";
import { createCourse, upload, storeComment, getComments, getCourses, requestCourse } from "../controllers/course.controller.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

// get method
router.get("/all", verifyJWT_username, getCourses);
router.get("/:id/comments", verifyJWT_username, getComments);

// post method
router.post("/new", verifyJWT_username, upload.single("image"), createCourse);
router.post("/request", verifyJWT_username, requestCourse);
router.post("/:id/comments", verifyJWT_username, storeComment);


export default router;