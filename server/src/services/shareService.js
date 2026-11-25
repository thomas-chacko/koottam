import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Share a post
 */
export const sharePost = async ({ userId, postId }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if post exists
    const postCheck = await client.query(
      `SELECT id FROM posts WHERE id = $1`,
      [postId]
    );

    if (!postCheck.rows[0]) {
      throw new AppError("Post not found", 404);
    }

    // Insert share
    const shareResult = await client.query(
      `INSERT INTO shares (user_id, post_id)
       VALUES ($1, $2)
       RETURNING id, user_id, post_id, created_at`,
      [userId, postId]
    );

    // Increment post share_count
    await client.query(
      `UPDATE posts SET share_count = share_count + 1 WHERE id = $1`,
      [postId]
    );

    await client.query("COMMIT");

    return { share: shareResult.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get users who shared a post
 */
export const getPostSharers = async ({ postId, limit = 20, offset = 0 }) => {
  // Check if post exists
  const postCheck = await db.query(`SELECT id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!postCheck.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  const result = await db.query(
    `SELECT
       u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
       s.created_at AS shared_at
     FROM shares s
     JOIN users u ON u.id = s.user_id
     WHERE s.post_id = $1
     ORDER BY s.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return { sharers: result.rows };
};

/**
 * Get user's shared posts
 */
export const getUserShares = async ({ userId, limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.location,
       p.visibility, p.view_count, p.like_count, p.comment_count,
       p.share_count, p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       s.created_at AS shared_at
     FROM shares s
     JOIN posts p ON p.id = s.post_id
     JOIN users u ON u.id = p.user_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { shares: result.rows };
};

/**
 * Delete a share
 */
export const deleteShare = async ({ userId, postId }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if share exists
    const shareCheck = await client.query(
      `SELECT id FROM shares WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (!shareCheck.rows[0]) {
      throw new AppError("Share not found", 404);
    }

    // Delete share
    await client.query(
      `DELETE FROM shares WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    // Decrement post share_count
    await client.query(
      `UPDATE posts SET share_count = GREATEST(share_count - 1, 0) WHERE id = $1`,
      [postId]
    );

    await client.query("COMMIT");

    return { message: "Share removed successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
