import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  sharePost,
  getPostSharers,
  getUserShares,
  deleteShare,
} from "../services/shareService.js";

// @desc    Share a post
// @route   POST /api/v1/share/:postId
// @access  Private
export const sharePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await sharePost({ userId: req.user.id, postId });

  return successResponse(res, 201, "Post shared successfully", data);
});

// @desc    Get users who shared a post
// @route   GET /api/v1/share/:postId/sharers
// @access  Public
export const getPostSharersController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostSharers({ postId, limit, offset });

  return successResponse(res, 200, "Post sharers retrieved successfully", data);
});

// @desc    Get user's shared posts
// @route   GET /api/v1/share/my-shares
// @access  Private
export const getUserSharesController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getUserShares({
    userId: req.user.id,
    limit,
    offset,
  });

  return successResponse(res, 200, "User shares retrieved successfully", data);
});

// @desc    Delete a share
// @route   DELETE /api/v1/share/:postId
// @access  Private
export const deleteShareController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await deleteShare({ userId: req.user.id, postId });

  return successResponse(res, 200, "Share removed successfully", data);
});
