import { Router } from "express";
import {
  createStoryController,
  getUserStoriesController,
  getFollowingStoriesController,
  viewStoryController,
  deleteStoryController,
} from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/story/following → Get stories from following users (auth required)
router.get("/following", protect, getFollowingStoriesController);

// GET /api/v1/story/user/:userId → Get user's stories (public)
router.get("/user/:userId", getUserStoriesController);

// POST /api/v1/story → Create story (auth required)
router.post("/", protect, createStoryController);

// POST /api/v1/story/:storyId/view → View story (auth required)
router.post("/:storyId/view", protect, viewStoryController);

// DELETE /api/v1/story/:storyId → Delete story (auth required)
router.delete("/:storyId", protect, deleteStoryController);

export default router;
