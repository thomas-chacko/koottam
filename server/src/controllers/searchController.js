import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { performGlobalSearch } from "../services/searchService.js";

// @desc    Global search across users, posts, and locations
// @route   GET /api/v1/search?q=query
// @access  Public
export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return successResponse(res, 200, "Search results", { users: [], posts: [], locations: [] });
  }

  const data = await performGlobalSearch(q);
  return successResponse(res, 200, "Search results retrieved successfully", data);
});
