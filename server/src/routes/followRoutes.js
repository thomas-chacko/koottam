import { Router } from "express";
import {
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
  checkFollowStatusController,
  getSuggestedUsersController,
} from "../controllers/followController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/follow/suggestions → Get suggested users (auth required)
router.get("/suggestions", protect, getSuggestedUsersController);

// GET /api/v1/follow/status/:userId → Check follow status (auth required)
router.get("/status/:userId", protect, checkFollowStatusController);

// POST /api/v1/follow/:userId → Follow user (auth required)
router.post("/:userId", protect, followUserController);

// DELETE /api/v1/follow/:userId → Unfollow user (auth required)
router.delete("/:userId", protect, unfollowUserController);

// GET /api/v1/follow/:userId/followers → Get followers (public)
router.get("/:userId/followers", getFollowersController);

// GET /api/v1/follow/:userId/following → Get following (public)
router.get("/:userId/following", getFollowingController);

export default router;
