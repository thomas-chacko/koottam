import db from "../config/db.js";
import AppError from "../utils/AppError.js";

export const getUserProfile = async (username) => {
  const userResult = await db.query(
    `SELECT 
      id, username, email, full_name, bio, 
      avatar_url, cover_url, location, website, 
      role, is_verified, is_active, is_private, 
      email_verified, followers_count, following_count, 
      posts_count, created_at 
     FROM users 
     WHERE username = $1`,
    [username]
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};

export const updateUserProfile = async (userId, updateData) => {
  const {
    username,
    full_name,
    bio,
    location,
    website,
    avatar_url,
    cover_url,
    is_private,
  } = updateData;

  // Check if username is being updated and if it's already taken
  if (username !== undefined) {
    const usernameCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND id != $2",
      [username, userId],
    );

    if (usernameCheck.rows.length > 0) {
      throw new AppError(
        "This username is already taken. Please choose another",
        400,
      );
    }
  }

  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (username !== undefined) {
    updates.push(`username = $${paramCount++}`);
    values.push(username);
  }
  if (full_name !== undefined) {
    updates.push(`full_name = $${paramCount++}`);
    values.push(full_name);
  }
  if (bio !== undefined) {
    updates.push(`bio = $${paramCount++}`);
    values.push(bio);
  }
  if (location !== undefined) {
    updates.push(`location = $${paramCount++}`);
    values.push(location);
  }
  if (website !== undefined) {
    updates.push(`website = $${paramCount++}`);
    values.push(website);
  }
  if (avatar_url !== undefined) {
    updates.push(`avatar_url = $${paramCount++}`);
    values.push(avatar_url);
  }
  if (cover_url !== undefined) {
    updates.push(`cover_url = $${paramCount++}`);
    values.push(cover_url);
  }
  if (is_private !== undefined) {
    updates.push(`is_private = $${paramCount++}`);
    values.push(is_private);
  }

  if (updates.length === 0) {
    throw new AppError("No fields to update", 400);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updates.join(", ")} 
    WHERE id = $${paramCount}
    RETURNING id, username, email, full_name, bio, avatar_url, cover_url, 
              location, website, role, is_verified, is_active, is_private, 
              email_verified, followers_count, following_count, posts_count, 
              created_at, updated_at
  `;

  const result = await db.query(query, values);

  if (!result.rows[0]) {
    throw new AppError("User not found", 404);
  }

  return { user: result.rows[0] };
};

export const deleteUserAccount = async (userId) => {
  // Check if user exists
  const userCheck = await db.query('SELECT id, username FROM users WHERE id = $1', [userId]);
  
  if (!userCheck.rows[0]) {
    throw new AppError('User not found', 404);
  }

  // Delete user (CASCADE will handle related data)
  await db.query('DELETE FROM users WHERE id = $1', [userId]);

  return { 
    message: 'Account deleted successfully',
    username: userCheck.rows[0].username 
  };
};
