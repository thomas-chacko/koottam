import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import db from '../config/db.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const userResult = await db.query(
      'SELECT id, username, email, full_name, avatar_url, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!userResult.rows[0]) {
      throw new AppError('User no longer exists', 401);
    }

    // Attach user to request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    throw error;
  }
});
