import { Router } from "express";
import { getProfile, updateProfile, deleteAccount } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// @route   GET /api/v1/user/:username
router.get("/:username", getProfile);

// @route   PUT /api/v1/user
router.put("/", protect, updateProfile);

// @route   DELETE /api/v1/user
router.delete("/", protect, deleteAccount);

export default router;
