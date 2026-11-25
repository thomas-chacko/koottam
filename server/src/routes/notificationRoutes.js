import { Router } from "express";
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
  getUnreadNotificationCountController,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/notification/unread-count → Get unread count (auth required)
router.get("/unread-count", protect, getUnreadNotificationCountController);

// PATCH /api/v1/notification/read-all → Mark all as read (auth required)
router.patch("/read-all", protect, markAllNotificationsAsReadController);

// GET /api/v1/notification → Get user notifications (auth required)
router.get("/", protect, getUserNotificationsController);

// PATCH /api/v1/notification/:notificationId/read → Mark as read (auth required)
router.patch("/:notificationId/read", protect, markNotificationAsReadController);

// DELETE /api/v1/notification/:notificationId → Delete notification (auth required)
router.delete("/:notificationId", protect, deleteNotificationController);

export default router;
