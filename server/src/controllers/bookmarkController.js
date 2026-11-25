import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmarkStatus,
} from "../services/bookmarkService.js";

// @desc    Add a post to bookmarks
// @route   POST /api/v1/bookmark/:postId
// @access  Private
export const addBookmarkController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await addBookmark({ userId: req.user.id, postId });

  return successResponse(res, 201, "Post bookmarked successfully", data);
});

// @desc    Remove a post from bookmarks
// @route   DELETE /api/v1/bookmark/:postId
// @access  Private
export const removeBookmarkController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await removeBookmark({ userId: req.user.id, postId });

  return successResponse(res, 200, "Bookmark removed successfully", data);
});

// @desc    Get user's bookmarked posts
// @route   GET /api/v1/bookmark/my-bookmarks
// @access  Private
export const getUserBookmarksController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getUserBookmarks({
    userId: req.user.id,
    limit,
    offset,
  });

  return successResponse(res, 200, "Bookmarks retrieved successfully", data);
});

// @desc    Check if a post is bookmarked
// @route   GET /api/v1/bookmark/status/:postId
// @access  Private
export const checkBookmarkStatusController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await checkBookmarkStatus({ userId: req.user.id, postId });

  return successResponse(res, 200, "Bookmark status retrieved successfully", data);
});
