import { Router } from "express";
import {
  recordPostViewController,
  getPostViewCountController,
  getPostViewersController,
} from "../controllers/viewController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/view/:postId/count → Get post view count (public)
router.get("/:postId/count", getPostViewCountController);

// GET /api/v1/view/:postId/viewers → Get post viewers (public)
router.get("/:postId/viewers", getPostViewersController);

// POST /api/v1/view/:postId → Record post view (auth required)
router.post("/:postId", protect, recordPostViewController);

export default router;
