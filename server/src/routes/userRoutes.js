import { Router } from "express";
import { getProfile } from "../controllers/userController.js";

const router = Router();

// @route   GET /api/v1/users/:username
router.get("/:username", getProfile);

export default router;
