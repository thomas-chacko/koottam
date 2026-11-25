import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  createPost,
  getPostById,
  deletePost,
  updatePost,
  getUserPosts,
} from "../services/postService.js";

const ALLOWED_VISIBILITY = ["public", "followers", "private"];
const CLOUDINARY_PATTERN = /^https?:\/\/res\.cloudinary\.com\//;
const TAG_PATTERN = /^[a-zA-Z0-9_\u0D00-\u0D7F]+$/; // letters, digits, underscore, Malayalam Unicode

// @desc    Create a new post
// @route   POST /api/v1/posts
// @access  Private
export const createPostController = asyncHandler(async (req, res) => {
  const { content, media_urls, visibility, tags, location } = req.body || {};

  // ── Validate content ────────────────────────────────────────────────────
  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Post content is required", 400);
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length > 500) {
    throw new AppError("Post content must be 500 characters or less", 400);
  }

  // ── Validate media_urls ─────────────────────────────────────────────────
  let validatedMediaUrls = [];
  if (media_urls !== undefined) {
    if (!Array.isArray(media_urls)) {
      throw new AppError("media_urls must be an array", 400);
    }
    if (media_urls.length > 4) {
      throw new AppError("You can attach a maximum of 4 images", 400);
    }
    for (const url of media_urls) {
      if (typeof url !== "string" || !CLOUDINARY_PATTERN.test(url)) {
        throw new AppError(
          "Each media URL must be a valid Cloudinary URL",
          400,
        );
      }
    }
    validatedMediaUrls = media_urls;
  }

  // ── Validate visibility ─────────────────────────────────────────────────
  let validatedVisibility = "public";
  if (visibility !== undefined) {
    if (!ALLOWED_VISIBILITY.includes(visibility)) {
      throw new AppError(
        "visibility must be one of: public, followers, private",
        400,
      );
    }
    validatedVisibility = visibility;
  }

  // ── Validate tags ───────────────────────────────────────────────────────
  let validatedTags = [];
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      throw new AppError("tags must be an array", 400);
    }
    if (tags.length > 5) {
      throw new AppError("You can add a maximum of 5 tags", 400);
    }
    for (const tag of tags) {
      if (typeof tag !== "string") {
        throw new AppError("Each tag must be a string", 400);
      }
      const cleanTag = tag.trim().replace(/^#/, "");
      if (!cleanTag) continue;
      if (cleanTag.length > 50) {
        throw new AppError(
          `Tag "${cleanTag}" is too long (max 50 characters)`,
          400,
        );
      }
      if (!TAG_PATTERN.test(cleanTag)) {
        throw new AppError(
          `Tag "${cleanTag}" contains invalid characters. Use only letters, digits, or underscores`,
          400,
        );
      }
      validatedTags.push(cleanTag);
    }
  }

  // ── Validate location ───────────────────────────────────────────────────
  let validatedLocation = null;
  if (location !== undefined) {
    if (typeof location !== "string") {
      throw new AppError("location must be a string", 400);
    }
    validatedLocation = location.trim();
    if (validatedLocation.length > 100) {
      throw new AppError("Location must be 100 characters or less", 400);
    }
  }

  // ── Call service ─────────────────────────────────────────────────────────
  const data = await createPost({
    userId: req.user.id,
    content: trimmedContent,
    mediaUrls: validatedMediaUrls,
    visibility: validatedVisibility,
    tags: validatedTags,
    location: validatedLocation,
  });

  return successResponse(res, 201, "Post created successfully", data);
});

// @desc    Get a single post by ID
// @route   GET /api/v1/posts/:id
// @access  Public
export const getPostController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await getPostById(id);

  return successResponse(res, 200, "Post retrieved successfully", data);
});

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:id
// @access  Private (owner only)
export const deletePostController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await deletePost({ postId: id, userId: req.user.id });

  return successResponse(res, 200, "Post deleted successfully", data);
});
// @desc    Update an existing post (content, media, visibility, tags)
// @route   PUT /api/v1/post/:id
// @access  Private (owner only)
export const updatePostController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const { content, media_urls, visibility, tags, location } = req.body || {};

  // At least one field must be present
  if (
    content === undefined &&
    media_urls === undefined &&
    visibility === undefined &&
    tags === undefined &&
    location === undefined
  ) {
    throw new AppError(
      "Provide at least one field to update: content, media_urls, visibility, tags, or location",
      400,
    );
  }

  // ── Validate content (if provided) ──────────────────────────────────────
  let trimmedContent;
  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      throw new AppError("content must be a non-empty string", 400);
    }
    trimmedContent = content.trim();
    if (trimmedContent.length > 500) {
      throw new AppError("Post content must be 500 characters or less", 400);
    }
  }

  // ── Validate media_urls (if provided) ──────────────────────────────────
  let validatedMediaUrls;
  if (media_urls !== undefined) {
    if (!Array.isArray(media_urls)) {
      throw new AppError("media_urls must be an array", 400);
    }
    if (media_urls.length > 4) {
      throw new AppError("You can attach a maximum of 4 images", 400);
    }
    for (const url of media_urls) {
      if (typeof url !== "string" || !CLOUDINARY_PATTERN.test(url)) {
        throw new AppError(
          "Each media URL must be a valid Cloudinary URL",
          400,
        );
      }
    }
    validatedMediaUrls = media_urls;
  }

  // ── Validate visibility (if provided) ──────────────────────────────────
  if (visibility !== undefined && !ALLOWED_VISIBILITY.includes(visibility)) {
    throw new AppError(
      "visibility must be one of: public, followers, private",
      400,
    );
  }

  // ── Validate tags (if provided) ─────────────────────────────────────────
  let validatedTags;
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      throw new AppError("tags must be an array", 400);
    }
    if (tags.length > 5) {
      throw new AppError("You can add a maximum of 5 tags", 400);
    }
    validatedTags = [];
    for (const tag of tags) {
      if (typeof tag !== "string") {
        throw new AppError("Each tag must be a string", 400);
      }
      const cleanTag = tag.trim().replace(/^#/, "");
      if (!cleanTag) continue;
      if (cleanTag.length > 50) {
        throw new AppError(
          `Tag "${cleanTag}" is too long (max 50 characters)`,
          400,
        );
      }
      if (!TAG_PATTERN.test(cleanTag)) {
        throw new AppError(
          `Tag "${cleanTag}" contains invalid characters. Use only letters, digits, or underscores`,
          400,
        );
      }
      validatedTags.push(cleanTag);
    }
  }

  // ── Validate location (if provided) ──────────────────────────────────────
  let validatedLocation;
  if (location !== undefined) {
    if (typeof location !== "string") {
      throw new AppError("location must be a string", 400);
    }
    validatedLocation = location.trim();
    if (validatedLocation.length > 100) {
      throw new AppError("Location must be 100 characters or less", 400);
    }
  }

  const data = await updatePost({
    postId: id,
    userId: req.user.id,
    content: trimmedContent,
    mediaUrls: validatedMediaUrls,
    visibility,
    tags: validatedTags,
    location: validatedLocation,
  });

  return successResponse(res, 200, "Post updated successfully", data);
});

// @desc    Get posts by username
// @route   GET /api/v1/post/user/:username
// @access  Public
export const getPostsByUsernameController = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getUserPosts(username, { limit, offset });

  return successResponse(res, 200, "Posts retrieved successfully", data);
});
