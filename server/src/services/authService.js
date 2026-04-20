import db from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/security.js';
import { generateToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

export const registerUser = async ({ username, email, password, full_name }) => {
  // Check email conflict
  const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    throw new AppError('An account with this email already exists', 400);
  }

  // Check username conflict
  const usernameCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
  if (usernameCheck.rows.length > 0) {
    throw new AppError('This username is already taken. Please choose another', 400);
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Insert new user into the database
  const insertUserResult = await db.query(
    `INSERT INTO users (username, email, password, full_name) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, full_name, avatar_url, role, created_at`,
    [username, email, hashedPassword, full_name || null]
  );

  const newUser = insertUserResult.rows[0];

  // Generate secure JWT token
  const token = generateToken(newUser.id);

  return { user: newUser, token };
};

export const loginUser = async ({ email, password }) => {
  // Look up the user
  const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];

  if (!user) {
    throw new AppError('No account found with that email address', 404);
  }

  // Compare hashed passwords
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError('Incorrect password. Please try again', 401);
  }

  // Create Token
  const token = generateToken(user.id);

  // Exclude password from the returned object safely
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const logoutUser = async ({ userId }) => {
  return { message: 'Logged out successfully', userId };
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  // Get user with password
  const userResult = await db.query('SELECT id, password FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);

  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await db.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, userId]);

  return { message: 'Password changed successfully' };
};
