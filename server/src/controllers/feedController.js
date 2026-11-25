import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  getHomeFeed,
  getExploreFeed,
} from "../services/feedService.js";

// @desc    Get home feed (posts from followed users + own posts)
// @route   GET /api/v1/feed/home
// @access  Private
export const getHomeFeedController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;
  const cursor = req.query.cursor || null;

  const data = await getHomeFeed(req.user.id, { limit, offset, cursor });

  return successResponse(res, 200, "Home feed retrieved successfully", data);
});

// @desc    Get explore feed (trending posts from non-followed users)
// @route   GET /api/v1/feed/explore
// @access  Private
export const getExploreFeedController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getExploreFeed(req.user.id, { limit, offset });

  return successResponse(res, 200, "Explore feed retrieved successfully", data);
});
