import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  getTrendingHashtags,
  getPostsByHashtag,
  searchHashtags,
} from "../services/hashtagService.js";

// @desc    Get trending hashtags
// @route   GET /api/v1/hashtag/trending
// @access  Public
export const getTrendingHashtagsController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const data = await getTrendingHashtags({ limit });

  return successResponse(res, 200, "Trending hashtags retrieved successfully", data);
});

// @desc    Get posts by hashtag
// @route   GET /api/v1/hashtag/:hashtag/posts
// @access  Public
export const getPostsByHashtagController = asyncHandler(async (req, res) => {
  const { hashtag } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!hashtag) {
    throw new AppError("Hashtag is required", 400);
  }

  const data = await getPostsByHashtag({ hashtag, limit, offset });

  return successResponse(res, 200, "Posts retrieved successfully", data);
});

// @desc    Search hashtags
// @route   GET /api/v1/hashtag/search
// @access  Public
export const searchHashtagsController = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!q) {
    throw new AppError("Search query is required", 400);
  }

  const data = await searchHashtags({ query: q, limit });

  return successResponse(res, 200, "Hashtags retrieved successfully", data);
});
