import { Router } from "express";
import { getUploadSignature } from "../controllers/mediaController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// @route   POST /api/v1/media/upload
router.post("/upload", protect, getUploadSignature);

export default router;
