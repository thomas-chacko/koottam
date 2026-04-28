import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// @route   GET /api/v1/user/:username
router.get("/:username", getProfile);

// @route   PUT /api/v1/user
router.put("/", protect, updateProfile);

export default router;
