import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getUserProfile } from "../services/userService.js";

// @desc    Get user profile
// @route   GET /api/v1/users/:username
// @access  Public
export const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const data = await getUserProfile(username);

  return successResponse(res, 200, "User profile retrieved successfully", data);
});
