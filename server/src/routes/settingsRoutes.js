import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getSettingsController,
  updatePrivacyController,
  updateNotificationsController,
  getBlockedUsersController,
  blockUserController,
  unblockUserController,
} from "../controllers/settingsController.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Settings routes
router.get("/", getSettingsController);
router.put("/privacy", updatePrivacyController);
router.put("/notifications", updateNotificationsController);

// Blocked users routes
router.get("/blocked-users", getBlockedUsersController);
router.post("/block/:userId", blockUserController);
router.delete("/unblock/:userId", unblockUserController);

export default router;

