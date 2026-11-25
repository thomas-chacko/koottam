import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from "../services/notificationService.js";

// @desc    Get user notifications
// @route   GET /api/v1/notification
// @access  Private
export const getUserNotificationsController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;
  const type = req.query.type; // Optional filter by type

  const data = await getUserNotifications({
    userId: req.user.id,
    limit,
    offset,
    type,
  });

  return successResponse(res, 200, "Notifications retrieved successfully", data);
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notification/:notificationId/read
// @access  Private
export const markNotificationAsReadController = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new AppError("Notification ID is required", 400);
  }

  const data = await markNotificationAsRead({
    userId: req.user.id,
    notificationId,
  });

  return successResponse(res, 200, "Notification marked as read", data);
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notification/read-all
// @access  Private
export const markAllNotificationsAsReadController = asyncHandler(async (req, res) => {
  const data = await markAllNotificationsAsRead({ userId: req.user.id });

  return successResponse(res, 200, "All notifications marked as read", data);
});

// @desc    Delete a notification
// @route   DELETE /api/v1/notification/:notificationId
// @access  Private
export const deleteNotificationController = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new AppError("Notification ID is required", 400);
  }

  const data = await deleteNotification({
    userId: req.user.id,
    notificationId,
  });

  return successResponse(res, 200, "Notification deleted successfully", data);
});

// @desc    Get unread notification count
// @route   GET /api/v1/notification/unread-count
// @access  Private
export const getUnreadNotificationCountController = asyncHandler(async (req, res) => {
  const data = await getUnreadNotificationCount({ userId: req.user.id });

  return successResponse(res, 200, "Unread count retrieved successfully", data);
});
