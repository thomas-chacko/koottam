import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../services/userService.js";

// @desc    Get user profile by username
// @route   GET /api/v1/user/:username
// @access  Public
export const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const data = await getUserProfile(username);

  return successResponse(res, 200, "User profile retrieved successfully", data);
});

// @desc    Update current user profile
// @route   PUT /api/v1/user
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    username,
    full_name,
    bio,
    location,
    website,
    avatar_url,
    cover_url,
    is_private,
  } = req.body || {};

  const data = await updateUserProfile(req.user.id, {
    username,
    full_name,
    bio,
    location,
    website,
    avatar_url,
    cover_url,
    is_private,
  });

  return successResponse(res, 200, "Profile updated successfully", data);
});

// @desc    Delete user account
// @route   DELETE /api/v1/user
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const data = await deleteUserAccount(req.user.id);

  return successResponse(res, 200, "Account deleted successfully", data);
});
