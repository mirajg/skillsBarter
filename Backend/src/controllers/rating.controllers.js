
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Rating } from "../models/rating.model.js";

export const rateUser = asyncHandler(async (req, res) => {
  console.log("\n******** Inside rateUser Controller function ********");

  const { rating, description, ratedUsername } = req.body;

  if (!rating || !description || !ratedUsername) {
    throw new ApiError(400, "Please provide all the details");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const user = await User.findOne({ username: ratedUsername });
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const rateGiver = req.user._id;

  if (rateGiver.toString() === user._id.toString()) {
    throw new ApiError(400, "You cannot rate yourself");
  }

  // find if there is chat between the two users
  const chat = await Chat.findOne({
    users: { $all: [rateGiver, user._id] },
  });

  if (!chat) {
    throw new ApiError(400, "Please connect first to rate the user");
  }

  const rateExist = await Rating.findOne({
    rater: rateGiver,
    ratedUsername,
  });

  if (rateExist) {
    throw new ApiError(400, "You have already rated this user");
  }

  const rate = await Rating.create({
    rating,
    description,
    ratedUsername,
    rater: rateGiver,
  });

  if (!rate) {
    throw new ApiError(500, "Rating not added");
  }

  const ratings = await Rating.find({ ratedUsername: ratedUsername });

  const total = ratings.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = (total / ratings.length).toFixed(2);

  await User.findByIdAndUpdate(user._id, { rating: avgRating });

  res
    .status(200)
    .json(new ApiResponse(200, rate, "Rating added successfully"));
});

export const giftUser = asyncHandler(async (req, res) => {
  const { username, amount } = req.body;
  const giftGivenBy = req.user._id;

  if (!username || !amount) {
    throw new ApiError(400, "Please provide username and amount");
  }

  const giftAmount = Number(amount);
  if (isNaN(giftAmount) || giftAmount <= 0) {
    throw new ApiError(400, "Amount must be a positive number");
  }

  const recipient = await User.findOne({ username });
  if (!recipient) {
    throw new ApiError(404, "Recipient not found");
  }

  if (giftGivenBy.toString() === recipient._id.toString()) {
    throw new ApiError(400, "You cannot gift credits to yourself");
  }

  const chat = await Chat.findOne({
    users: { $all: [giftGivenBy, recipient._id] },
  });

  if (!chat) {
    throw new ApiError(400, "Please connect first to gift credits to this user");
  }

  const sender = await User.findOneAndUpdate(
    { _id: giftGivenBy, learningCredits: { $gte: giftAmount } },
    { $inc: { learningCredits: -giftAmount } },
    { returnDocument: "after" }
  );

  if (!sender) {
    throw new ApiError(400, "Insufficient credits");
  }

  let updatedRecipient;
  try {
    updatedRecipient = await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { learningCredits: giftAmount } },
      { returnDocument: "after" }
    );
  } catch (error) {
    await User.findByIdAndUpdate(giftGivenBy, {
      $inc: { learningCredits: giftAmount },
    });
    throw new ApiError(500, "Gift failed, amount refunded to sender");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { senderBalance: sender.learningCredits, recipient: updatedRecipient.username },
        "Credits gifted successfully"
      )
    );
});

export const getTokens = asyncHandler(async (req, res) => {
  const TOKEN_REWARD = 0.05;
  const CLAIM_COOLDOWN_MS = 60 * 1000; // adjust to your ad length / policy
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const now = Date.now();
  if (user.lastTokenClaimAt && now - user.lastTokenClaimAt.getTime() < CLAIM_COOLDOWN_MS) {
    return res.status(429).json({
      message: "You must wait before claiming again",
      retryAfterMs: CLAIM_COOLDOWN_MS - (now - user.lastTokenClaimAt.getTime()),
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { learningCredits: TOKEN_REWARD },
      $set: { lastTokenClaimAt: new Date(now) },
    },
    { new: true }
  );

  return res.status(200).json({
    message: "Token claimed successfully",
    learningCredits: updatedUser.learningCredits,
  });
});

const TOKEN_TIERS = {
  t10: { tokens: 10, price: 99 },
  t50: { tokens: 50, price: 449 },
  t100: { tokens: 100, price: 899 },
};

export const buyTokens = asyncHandler(async (req, res) => {
  const { tierId, method } = req.body;
  const userId = req.user._id;

  const tier = TOKEN_TIERS[tierId];
  if (!tier) {
    return res.status(400).json({ message: "Invalid tier selected" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { learningCredits: tier.tokens } },
    { new: true }
  );

  return res.status(200).json({
    message: "Payment Done & credits added",
    learningCredits: updatedUser.learningCredits,
    tokensAdded: tier.tokens,
  });
});