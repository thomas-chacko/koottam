import AppError from "../utils/AppError.js";

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError("Access denied. Admin privileges required.", 403);
  }

  next();
};

/**
 * Middleware to check if user is a moderator
 */
export const isModerator = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  if (req.user.role !== "moderator") {
    throw new AppError("Access denied. Moderator privileges required.", 403);
  }

  next();
};

/**
 * Middleware to check if user is either an admin or moderator
 */
export const isAdminOrModerator = (req, res, next) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    throw new AppError(
      "Access denied. Admin or Moderator privileges required.",
      403
    );
  }

  next();
};

