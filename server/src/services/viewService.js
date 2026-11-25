import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Record a post view
 */
export const recordPostView = async ({ userId, postId }) => {
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

    // Check if view already exists (to prevent duplicate views from same user)
    const existingView = await client.query(
      `SELECT id FROM post_views WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existingView.rows[0]) {
      // View already recorded, just return success
      await client.query("COMMIT");
      return { message: "View already recorded" };
    }

    // Insert view
    await client.query(
      `INSERT INTO post_views (post_id, user_id)
       VALUES ($1, $2)`,
      [postId, userId]
    );

    // Increment post view_count
    await client.query(
      `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
      [postId]
    );

    await client.query("COMMIT");

    return { message: "View recorded successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get post view count
 */
export const getPostViewCount = async ({ postId }) => {
  // Check if post exists
  const postCheck = await db.query(
    `SELECT id, view_count FROM posts WHERE id = $1`,
    [postId]
  );

  if (!postCheck.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  return { viewCount: postCheck.rows[0].view_count };
};

/**
 * Get users who viewed a post
 */
export const getPostViewers = async ({ postId, limit = 20, offset = 0 }) => {
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
       pv.created_at AS viewed_at
     FROM post_views pv
     JOIN users u ON u.id = pv.user_id
     WHERE pv.post_id = $1
     ORDER BY pv.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return { viewers: result.rows };
};
