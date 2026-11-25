import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Create a new story (expires in 24 hours)
 */
export const createStory = async ({ userId, mediaUrl }) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const result = await db.query(
    `INSERT INTO stories (user_id, media_url, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, media_url, view_count, expires_at, created_at`,
    [userId, mediaUrl, expiresAt]
  );

  return { story: result.rows[0] };
};

/**
 * Get a user's active stories (not expired)
 */
export const getUserStories = async ({ userId }) => {
  const result = await db.query(
    `SELECT
       s.id, s.user_id, s.media_url, s.view_count, s.expires_at, s.created_at,
       u.username, u.full_name, u.avatar_url, u.is_verified
     FROM stories s
     JOIN users u ON u.id = s.user_id
     WHERE s.user_id = $1 AND s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [userId]
  );

  return { stories: result.rows };
};

/**
 * Get stories from users that current user follows
 */
export const getFollowingStories = async ({ userId }) => {
  const result = await db.query(
    `SELECT
       s.id, s.user_id, s.media_url, s.view_count, s.expires_at, s.created_at,
       u.username, u.full_name, u.avatar_url, u.is_verified
     FROM stories s
     JOIN users u ON u.id = s.user_id
     JOIN follows f ON f.following_id = s.user_id
     WHERE f.follower_id = $1 AND s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [userId]
  );

  return { stories: result.rows };
};

/**
 * Record a story view and increment view count
 */
export const viewStory = async ({ userId, storyId }) => {
  // Check if story exists and is not expired
  const storyCheck = await db.query(
    `SELECT id, user_id FROM stories WHERE id = $1 AND expires_at > NOW()`,
    [storyId]
  );

  if (!storyCheck.rows[0]) {
    throw new AppError("Story not found or expired", 404);
  }

  // Increment view count
  await db.query(
    `UPDATE stories SET view_count = view_count + 1 WHERE id = $1`,
    [storyId]
  );

  return { message: "Story view recorded successfully" };
};

/**
 * Delete a story (only owner can delete)
 */
export const deleteStory = async ({ userId, storyId }) => {
  // Check if story exists and belongs to user
  const storyCheck = await db.query(
    `SELECT id FROM stories WHERE id = $1 AND user_id = $2`,
    [storyId, userId]
  );

  if (!storyCheck.rows[0]) {
    throw new AppError("Story not found or you don't have permission to delete it", 404);
  }

  // Delete story
  await db.query(`DELETE FROM stories WHERE id = $1`, [storyId]);

  return { message: "Story deleted successfully" };
};
