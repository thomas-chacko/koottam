import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Add a post to bookmarks
 */
export const addBookmark = async ({ userId, postId }) => {
  // Check if post exists
  const postCheck = await db.query(`SELECT id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!postCheck.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  // Check if already bookmarked
  const existingBookmark = await db.query(
    `SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  if (existingBookmark.rows[0]) {
    throw new AppError("Post already bookmarked", 400);
  }

  // Insert bookmark
  const result = await db.query(
    `INSERT INTO bookmarks (user_id, post_id)
     VALUES ($1, $2)
     RETURNING id, user_id, post_id, created_at`,
    [userId, postId]
  );

  return { bookmark: result.rows[0] };
};

/**
 * Remove a post from bookmarks
 */
export const removeBookmark = async ({ userId, postId }) => {
  // Check if bookmark exists
  const bookmarkCheck = await db.query(
    `SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  if (!bookmarkCheck.rows[0]) {
    throw new AppError("Bookmark not found", 404);
  }

  // Delete bookmark
  await db.query(
    `DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  return { message: "Bookmark removed successfully" };
};

/**
 * Get user's bookmarked posts with pagination
 */
export const getUserBookmarks = async ({ userId, limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.location,
       p.visibility, p.view_count, p.like_count, p.comment_count,
       p.share_count, p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       b.created_at AS bookmarked_at
     FROM bookmarks b
     JOIN posts p ON p.id = b.post_id
     JOIN users u ON u.id = p.user_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { bookmarks: result.rows };
};

/**
 * Check if a post is bookmarked by user
 */
export const checkBookmarkStatus = async ({ userId, postId }) => {
  const result = await db.query(
    `SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );

  return {
    bookmarked: result.rows.length > 0,
    postId,
  };
};
