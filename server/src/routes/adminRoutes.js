import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { isAdmin, isAdminOrModerator } from "../middleware/roleCheck.js";
import {
  getUsersController,
  getStatsController,
  verifyUserController,
  suspendUserController,
  activateUserController,
  updateRoleController,
  deletePostController,
} from "../controllers/adminController.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get("/users", isAdmin, getUsersController);
router.get("/stats", isAdmin, getStatsController);
router.put("/user/:id/verify", isAdmin, verifyUserController);
router.put("/user/:id/role", isAdmin, updateRoleController);

// Admin or Moderator routes
router.put("/user/:id/suspend", isAdminOrModerator, suspendUserController);
router.put("/user/:id/activate", isAdminOrModerator, activateUserController);
router.delete("/post/:id", isAdminOrModerator, deletePostController);

export default router;

