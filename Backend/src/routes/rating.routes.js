
import express from "express";
import { rateUser, giftUser } from "../controllers/rating.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/rateUser", verifyJWT_username, rateUser);
router.post("/giftCredits", verifyJWT_username, giftUser);
// router.get("/getRatings/:username", verifyJWT_username, getRatings);

export default router;
