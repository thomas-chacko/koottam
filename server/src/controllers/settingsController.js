import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  getUserSettings,
  updatePrivacySettings,
  updateNotificationSettings,
  getBlockedUsers,
  blockUser,
  unblockUser,
} from "../services/settingsService.js";

// @desc    Get user settings
// @route   GET /api/v1/settings
// @access  Private
export const getSettingsController = asyncHandler(async (req, res) => {
  const data = await getUserSettings({ userId: req.user.id });

  return successResponse(res, 200, "Settings retrieved successfully", data);
});

// @desc    Update privacy settings
// @route   PUT /api/v1/settings/privacy
// @access  Private
export const updatePrivacyController = asyncHandler(async (req, res) => {
  const privacySettings = req.body;

  if (!privacySettings || Object.keys(privacySettings).length === 0) {
    throw new AppError("Privacy settings are required", 400);
  }

  const data = await updatePrivacySettings({
    userId: req.user.id,
    privacySettings,
  });

  return successResponse(res, 200, "Privacy settings updated successfully", data);
});

// @desc    Update notification settings
// @route   PUT /api/v1/settings/notifications
// @access  Private
export const updateNotificationsController = asyncHandler(async (req, res) => {
  const notificationSettings = req.body;

  if (!notificationSettings || Object.keys(notificationSettings).length === 0) {
    throw new AppError("Notification settings are required", 400);
  }

  const data = await updateNotificationSettings({
    userId: req.user.id,
    notificationSettings,
  });

  return successResponse(
    res,
    200,
    "Notification settings updated successfully",
    data
  );
});

// @desc    Get blocked users list
// @route   GET /api/v1/settings/blocked-users
// @access  Private
export const getBlockedUsersController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getBlockedUsers({
    userId: req.user.id,
    limit,
    offset,
  });

  return successResponse(res, 200, "Blocked users retrieved successfully", data);
});

// @desc    Block a user
// @route   POST /api/v1/settings/block/:userId
// @access  Private
export const blockUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await blockUser({
    blockerId: req.user.id,
    blockedId: userId,
  });

  return successResponse(res, 201, "User blocked successfully", data);
});

// @desc    Unblock a user
// @route   DELETE /api/v1/settings/unblock/:userId
// @access  Private
export const unblockUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await unblockUser({
    blockerId: req.user.id,
    blockedId: userId,
  });

  return successResponse(res, 200, "User unblocked successfully", data);
});

