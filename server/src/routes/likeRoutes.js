import { Router } from "express";
import {
  likePostController,
  unlikePostController,
  likeCommentController,
  unlikeCommentController,
  getPostLikersController,
  getCommentLikersController,
  checkLikeStatusController,
} from "../controllers/likeController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST   /api/v1/like/post/:postId              → Like a post (auth required)
router.post("/post/:postId", protect, likePostController);

// DELETE /api/v1/like/post/:postId              → Unlike a post (auth required)
router.delete("/post/:postId", protect, unlikePostController);

// POST   /api/v1/like/comment/:commentId        → Like a comment (auth required)
router.post("/comment/:commentId", protect, likeCommentController);

// DELETE /api/v1/like/comment/:commentId        → Unlike a comment (auth required)
router.delete("/comment/:commentId", protect, unlikeCommentController);

// GET    /api/v1/like/post/:postId/likers       → Get post likers (public)
router.get("/post/:postId/likers", getPostLikersController);

// GET    /api/v1/like/comment/:commentId/likers → Get comment likers (public)
router.get("/comment/:commentId/likers", getCommentLikersController);

// GET    /api/v1/like/status                    → Check like status (auth required)
router.get("/status", protect, checkLikeStatusController);

export default router;
