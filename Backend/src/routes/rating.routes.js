
import express from "express";
import { rateUser, giftUser, getTokens, buyTokens } from "../controllers/rating.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/rateUser", verifyJWT_username, rateUser);
router.post("/giftCredits", verifyJWT_username, giftUser);
router.post("/tokens/claim", verifyJWT_username, getTokens);
router.post("/tokens/buy", verifyJWT_username, buyTokens);
// router.get("/getRatings/:username", verifyJWT_username, getRatings);

export default router;
