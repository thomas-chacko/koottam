import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { isAdminOrModerator } from "../middleware/roleCheck.js";
import {
  reportPostController,
  reportUserController,
  getReportsController,
  reviewReportController,
  dismissReportController,
} from "../controllers/reportController.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Report routes (public to authenticated users)
router.post("/post/:postId", reportPostController);
router.post("/user/:userId", reportUserController);

// Admin/Moderator only routes
router.get("/", isAdminOrModerator, getReportsController);
router.put("/:id/review", isAdminOrModerator, reviewReportController);
router.put("/:id/dismiss", isAdminOrModerator, dismissReportController);

export default router;

