import { Router } from "express";
import {
  createCommentController,
  updateCommentController,
  deleteCommentController,
  getPostCommentsController,
  getCommentRepliesController,
  getCommentController,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST   /api/v1/comment/:postId            → Create comment (auth required)
router.post("/:postId", protect, createCommentController);

// GET    /api/v1/comment/post/:postId       → Get post comments (public)
router.get("/post/:postId", getPostCommentsController);

// GET    /api/v1/comment/:id                → Get single comment (public)
router.get("/:id", getCommentController);

// GET    /api/v1/comment/:id/replies        → Get comment replies (public)
router.get("/:id/replies", getCommentRepliesController);

// PUT    /api/v1/comment/:id                → Update comment (auth required, owner only)
router.put("/:id", protect, updateCommentController);

// DELETE /api/v1/comment/:id                → Delete comment (auth required, owner only)
router.delete("/:id", protect, deleteCommentController);

export default router;
