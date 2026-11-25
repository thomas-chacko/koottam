import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
  getPostLikers,
  getCommentLikers,
  checkLikeStatus,
} from "../services/likeService.js";

// @desc    Like a post
// @route   POST /api/v1/like/post/:postId
// @access  Private
export const likePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await likePost({ userId: req.user.id, postId });

  return successResponse(res, 201, "Post liked successfully", data);
});

// @desc    Unlike a post
// @route   DELETE /api/v1/like/post/:postId
// @access  Private
export const unlikePostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await unlikePost({ userId: req.user.id, postId });

  return successResponse(res, 200, "Post unliked successfully", data);
});

// @desc    Like a comment
// @route   POST /api/v1/like/comment/:commentId
// @access  Private
export const likeCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await likeComment({ userId: req.user.id, commentId });

  return successResponse(res, 201, "Comment liked successfully", data);
});

// @desc    Unlike a comment
// @route   DELETE /api/v1/like/comment/:commentId
// @access  Private
export const unlikeCommentController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await unlikeComment({ userId: req.user.id, commentId });

  return successResponse(res, 200, "Comment unliked successfully", data);
});

// @desc    Get users who liked a post
// @route   GET /api/v1/like/post/:postId/likers
// @access  Public
export const getPostLikersController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostLikers({ postId, limit, offset });

  return successResponse(res, 200, "Post likers retrieved successfully", data);
});

// @desc    Get users who liked a comment
// @route   GET /api/v1/like/comment/:commentId/likers
// @access  Public
export const getCommentLikersController = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!commentId) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await getCommentLikers({ commentId, limit, offset });

  return successResponse(
    res,
    200,
    "Comment likers retrieved successfully",
    data
  );
});

// @desc    Check if user has liked a post or comment
// @route   GET /api/v1/like/status
// @access  Private
export const checkLikeStatusController = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.query;

  const data = await checkLikeStatus({
    userId: req.user.id,
    postId,
    commentId,
  });

  return successResponse(res, 200, "Like status retrieved successfully", data);
});
