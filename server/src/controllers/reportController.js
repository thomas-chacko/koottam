import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  reportPost,
  reportUser,
  getReports,
  reviewReport,
  dismissReport,
} from "../services/reportService.js";

// @desc    Report a post
// @route   POST /api/v1/report/post/:postId
// @access  Private
export const reportPostController = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { reason, description } = req.body;

  if (!postId) {
    throw new AppError("Post ID is required", 400);
  }

  if (!reason) {
    throw new AppError("Reason is required", 400);
  }

  const data = await reportPost({
    reporterId: req.user.id,
    postId,
    reason,
    description,
  });

  return successResponse(res, 201, "Post reported successfully", data);
});

// @desc    Report a user
// @route   POST /api/v1/report/user/:userId
// @access  Private
export const reportUserController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason, description } = req.body;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  if (!reason) {
    throw new AppError("Reason is required", 400);
  }

  const data = await reportUser({
    reporterId: req.user.id,
    reportedUserId: userId,
    reason,
    description,
  });

  return successResponse(res, 201, "User reported successfully", data);
});

// @desc    Get all reports
// @route   GET /api/v1/report
// @access  Private (Admin/Moderator)
export const getReportsController = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  // Validate status if provided
  if (status && !["pending", "reviewed", "dismissed"].includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  const data = await getReports({ status, limit, offset });

  return successResponse(res, 200, "Reports retrieved successfully", data);
});

// @desc    Review a report
// @route   PUT /api/v1/report/:id/review
// @access  Private (Admin/Moderator)
export const reviewReportController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!id) {
    throw new AppError("Report ID is required", 400);
  }

  if (!action) {
    throw new AppError("Action is required", 400);
  }

  const data = await reviewReport({
    reportId: id,
    reviewerId: req.user.id,
    action,
  });

  return successResponse(res, 200, "Report reviewed successfully", data);
});

// @desc    Dismiss a report
// @route   PUT /api/v1/report/:id/dismiss
// @access  Private (Admin/Moderator)
export const dismissReportController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Report ID is required", 400);
  }

  const data = await dismissReport({
    reportId: id,
    reviewerId: req.user.id,
  });

  return successResponse(res, 200, "Report dismissed successfully", data);
});

