import { Router } from "express";
import {
  addBookmarkController,
  removeBookmarkController,
  getUserBookmarksController,
  checkBookmarkStatusController,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/bookmark/my-bookmarks → Get user's bookmarks (auth required)
router.get("/my-bookmarks", protect, getUserBookmarksController);

// GET /api/v1/bookmark/status/:postId → Check bookmark status (auth required)
router.get("/status/:postId", protect, checkBookmarkStatusController);

// POST /api/v1/bookmark/:postId → Bookmark a post (auth required)
router.post("/:postId", protect, addBookmarkController);

// DELETE /api/v1/bookmark/:postId → Remove bookmark (auth required)
router.delete("/:postId", protect, removeBookmarkController);

export default router;
