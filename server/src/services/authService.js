import db from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/security.js';
import { generateToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

export const registerUser = async ({ username, email, password, full_name }) => {
  // Check if user already exists
  const existingUserResult = await db.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUserResult.rows.length > 0) {
    throw new AppError('User with that email or username already exists', 400);
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
    throw new AppError('Invalid credentials', 401);
  }

  // Compare hashed passwords
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Create Token
  const token = generateToken(user.id);

  // Exclude password from the returned object safely
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};
