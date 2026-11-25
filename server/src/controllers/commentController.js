import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentReplies,
  getComment,
} from "../services/commentService.js";

// @desc    Create a new comment or reply
// @route   POST /api/v1/comment/:postId
// @access  Private
export const createCommentController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, parent_id } = req.body || {};

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Comment content is required", 400);
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > 500) {
    throw new AppError("Comment content must be 500 characters or less", 400);
  }

  const data = await createComment({
    userId: req.user.id,
    postId,
    content: trimmedContent,
    parentId: parent_id || null,
  });

  return successResponse(res, 201, "Comment created successfully", data);
});

// @desc    Update a comment
// @route   PUT /api/v1/comment/:id
// @access  Private (owner only)
export const updateCommentController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body || {};

  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Comment content is required", 400);
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > 500) {
    throw new AppError("Comment content must be 500 characters or less", 400);
  }

  const data = await updateComment({
    commentId: id,
    userId: req.user.id,
    content: trimmedContent,
  });

  return successResponse(res, 200, "Comment updated successfully", data);
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comment/:id
// @access  Private (owner only)
export const deleteCommentController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await deleteComment({
    commentId: id,
    userId: req.user.id,
  });

  return successResponse(res, 200, "Comment deleted successfully", data);
});

// @desc    Get all top-level comments for a post
// @route   GET /api/v1/comment/post/:postId
// @access  Public
export const getPostCommentsController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostComments({ postId, limit, offset });

  return successResponse(res, 200, "Comments retrieved successfully", data);
});

// @desc    Get replies to a comment
// @route   GET /api/v1/comment/:id/replies
// @access  Public
export const getCommentRepliesController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await getCommentReplies({ commentId: id, limit, offset });

  return successResponse(res, 200, "Replies retrieved successfully", data);
});

// @desc    Get a single comment by ID
// @route   GET /api/v1/comment/:id
// @access  Public
export const getCommentController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const data = await getComment({ commentId: id });

  return successResponse(res, 200, "Comment retrieved successfully", data);
});
