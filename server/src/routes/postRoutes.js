import { Router } from "express";
import {
  createPostController,
  getPostController,
  deletePostController,
  updatePostController,
  getPostsByUsernameController,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// POST   /api/v1/post/createpost        → Create post (auth required)
router.post("/createpost", protect, createPostController);

// GET    /api/v1/post/user/:username  → All posts by a user (public)
router.get("/user/:username", getPostsByUsernameController);

// GET    /api/v1/post/:id      → Get single post (public)
router.get("/:id", getPostController);

// DELETE /api/v1/post/:id      → Delete post (auth required, owner only)
router.delete("/:id", protect, deletePostController);

// PUT    /api/v1/post/:id      → Edit post (auth required, owner only)
router.put("/:id", protect, updatePostController);

export default router;
