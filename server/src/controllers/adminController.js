import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  getAllUsers,
  getPlatformStats,
  verifyUser,
  suspendUser,
  activateUser,
  updateUserRole,
  deleteAnyPost,
} from "../services/adminService.js";

// @desc    Get all users (paginated)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getUsersController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  const { role, isActive, search } = req.query;

  // Validate role if provided
  if (role && !["user", "admin", "moderator"].includes(role)) {
    throw new AppError("Invalid role value", 400);
  }

  const data = await getAllUsers({
    limit,
    offset,
    role,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    search,
  });

  return successResponse(res, 200, "Users retrieved successfully", data);
});

// @desc    Get platform statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getStatsController = asyncHandler(async (req, res) => {
  const data = await getPlatformStats();

  return successResponse(res, 200, "Platform stats retrieved successfully", data);
});

// @desc    Verify user account
// @route   PUT /api/v1/admin/user/:id/verify
// @access  Private (Admin)
export const verifyUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const data = await verifyUser({ userId: id });

  return successResponse(res, 200, "User verified successfully", data);
});

// @desc    Suspend user account
// @route   PUT /api/v1/admin/user/:id/suspend
// @access  Private (Admin/Moderator)
export const suspendUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const data = await suspendUser({ userId: id, reason });

  return successResponse(res, 200, "User suspended successfully", data);
});

// @desc    Activate user account
// @route   PUT /api/v1/admin/user/:id/activate
// @access  Private (Admin/Moderator)
export const activateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  const data = await activateUser({ userId: id });

  return successResponse(res, 200, "User activated successfully", data);
});

// @desc    Update user role
// @route   PUT /api/v1/admin/user/:id/role
// @access  Private (Admin)
export const updateRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  if (!role) {
    throw new AppError("Role is required", 400);
  }

  const data = await updateUserRole({ userId: id, newRole: role });

  return successResponse(res, 200, "User role updated successfully", data);
});

// @desc    Delete any post (moderator action)
// @route   DELETE /api/v1/admin/post/:id
// @access  Private (Admin/Moderator)
export const deletePostController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const data = await deleteAnyPost({
    postId: id,
    deletedBy: req.user.id,
    reason,
  });

  return successResponse(res, 200, "Post deleted successfully", data);
});

