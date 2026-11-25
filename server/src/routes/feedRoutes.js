import { Router } from "express";
import {
  getHomeFeedController,
  getExploreFeedController,
} from "../controllers/feedController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/feed/home → Get home feed (auth required)
router.get("/home", protect, getHomeFeedController);

// GET /api/v1/feed/explore → Get explore feed (auth required)
router.get("/explore", protect, getExploreFeedController);

export default router;
