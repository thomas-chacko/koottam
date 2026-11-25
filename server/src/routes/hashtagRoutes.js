import { Router } from "express";
import {
  getTrendingHashtagsController,
  getPostsByHashtagController,
  searchHashtagsController,
} from "../controllers/hashtagController.js";

const router = Router();

// GET /api/v1/hashtag/trending → Get trending hashtags (public)
router.get("/trending", getTrendingHashtagsController);

// GET /api/v1/hashtag/search → Search hashtags (public)
router.get("/search", searchHashtagsController);

// GET /api/v1/hashtag/:hashtag/posts → Get posts by hashtag (public)
router.get("/:hashtag/posts", getPostsByHashtagController);

export default router;
