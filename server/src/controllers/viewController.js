import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  recordPostView,
  getPostViewCount,
  getPostViewers,
} from "../services/viewService.js";

// @desc    Record a post view
// @route   POST /api/v1/view/:postId
// @access  Private
export const recordPostViewController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await recordPostView({ userId: req.user.id, postId });

  return successResponse(res, 201, "View recorded successfully", data);
});

// @desc    Get post view count
// @route   GET /api/v1/view/:postId/count
// @access  Public
export const getPostViewCountController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostViewCount({ postId });

  return successResponse(res, 200, "View count retrieved successfully", data);
});

// @desc    Get users who viewed a post
// @route   GET /api/v1/view/:postId/viewers
// @access  Public
export const getPostViewersController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostViewers({ postId, limit, offset });

  return successResponse(res, 200, "Post viewers retrieved successfully", data);
});
