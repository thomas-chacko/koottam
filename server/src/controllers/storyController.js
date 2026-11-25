import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  createStory,
  getUserStories,
  getFollowingStories,
  viewStory,
  deleteStory,
} from "../services/storyService.js";

// @desc    Create a new story
// @route   POST /api/v1/story
// @access  Private
export const createStoryController = asyncHandler(async (req, res) => {
  const { mediaUrl } = req.body;

  if (!mediaUrl) {
    throw new AppError("Media URL is required", 400);
  }

  const data = await createStory({ userId: req.user.id, mediaUrl });

  return successResponse(res, 201, "Story created successfully", data);
});

// @desc    Get user's stories
// @route   GET /api/v1/story/user/:userId
// @access  Public
export const getUserStoriesController = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await getUserStories({ userId });

  return successResponse(res, 200, "User stories retrieved successfully", data);
});

// @desc    Get stories from users that current user follows
// @route   GET /api/v1/story/following
// @access  Private
export const getFollowingStoriesController = asyncHandler(async (req, res) => {
  const data = await getFollowingStories({ userId: req.user.id });

  return successResponse(res, 200, "Following stories retrieved successfully", data);
});

// @desc    Record a story view
// @route   POST /api/v1/story/:storyId/view
// @access  Private
export const viewStoryController = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new AppError("Story ID is required", 400);
  }

  const data = await viewStory({ userId: req.user.id, storyId });

  return successResponse(res, 200, "Story view recorded successfully", data);
});

// @desc    Delete a story
// @route   DELETE /api/v1/story/:storyId
// @access  Private
export const deleteStoryController = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new AppError("Story ID is required", 400);
  }

  const data = await deleteStory({ userId: req.user.id, storyId });

  return successResponse(res, 200, "Story deleted successfully", data);
});
