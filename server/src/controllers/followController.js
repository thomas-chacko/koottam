import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getSuggestedUsers,
} from "../services/followService.js";

// @desc    Follow a user
// @route   POST /api/v1/follow/:userId
// @access  Private
export const followUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await followUser(req.user.id, userId);

  return successResponse(res, 201, "User followed successfully", data);
});

// @desc    Unfollow a user
// @route   DELETE /api/v1/follow/:userId
// @access  Private
export const unfollowUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await unfollowUser(req.user.id, userId);

  return successResponse(res, 200, "User unfollowed successfully", data);
});

// @desc    Get followers of a user
// @route   GET /api/v1/follow/:userId/followers
// @access  Public
export const getFollowersController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await getFollowers(userId, { limit, offset });

  return successResponse(res, 200, "Followers retrieved successfully", data);
});

// @desc    Get users that a user is following
// @route   GET /api/v1/follow/:userId/following
// @access  Public
export const getFollowingController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await getFollowing(userId, { limit, offset });

  return successResponse(res, 200, "Following list retrieved successfully", data);
});

// @desc    Check if current user is following a specific user
// @route   GET /api/v1/follow/status/:userId
// @access  Private
export const checkFollowStatusController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await checkFollowStatus(req.user.id, userId);

  return successResponse(res, 200, "Follow status retrieved successfully", data);
});

// @desc    Get suggested users to follow
// @route   GET /api/v1/follow/suggestions
// @access  Private
export const getSuggestedUsersController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);

  const data = await getSuggestedUsers(req.user.id, limit);

  return successResponse(res, 200, "Suggested users retrieved successfully", data);
});
