import { Router } from "express";
import {
  sharePostController,
  getPostSharersController,
  getUserSharesController,
  deleteShareController,
} from "../controllers/shareController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/share/my-shares → Get user's shared posts (auth required)
router.get("/my-shares", protect, getUserSharesController);

// GET /api/v1/share/:postId/sharers → Get post sharers (public)
router.get("/:postId/sharers", getPostSharersController);

// POST /api/v1/share/:postId → Share a post (auth required)
router.post("/:postId", protect, sharePostController);

// DELETE /api/v1/share/:postId → Remove share (auth required)
router.delete("/:postId", protect, deleteShareController);

export default router;
