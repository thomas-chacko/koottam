import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
} from "../services/authService.js";

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, full_name } = req.body || {};

  if (!username || !email || !password) {
    throw new AppError("Please provide username, email, and password", 400);
  }

  const data = await registerUser({ username, email, password, full_name });

  return successResponse(res, 201, "User registered successfully", data);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const data = await loginUser({ email, password });

  return successResponse(res, 200, "User logged in successfully", data);
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const data = await logoutUser({ userId: req.user.id });

  return successResponse(res, 200, "User logged out successfully", data);
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePasswordController = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current password and new password", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const data = await changePassword({
    userId: req.user.id,
    currentPassword,
    newPassword,
  });

  return successResponse(res, 200, "Password changed successfully", data);
});
