import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Like a post - insert into likes table and increment post like_count
 */
export const likePost = async ({ userId, postId }) => {
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

    // Check if already liked
    const existingLike = await client.query(
      `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (existingLike.rows[0]) {
      throw new AppError("You have already liked this post", 400);
    }

    // Insert like
    const likeResult = await client.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       RETURNING id, user_id, post_id, created_at`,
      [userId, postId]
    );

    // Increment post like_count
    await client.query(
      `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
      [postId]
    );

    await client.query("COMMIT");

    return { like: likeResult.rows[0] };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Unlike a post - delete from likes table and decrement post like_count
 */
export const unlikePost = async ({ userId, postId }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if like exists
    const likeCheck = await client.query(
      `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    if (!likeCheck.rows[0]) {
      throw new AppError("You have not liked this post", 400);
    }

    // Delete like
    await client.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    // Decrement post like_count with floor at 0
    await client.query(
      `UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1`,
      [postId]
    );

    await client.query("COMMIT");

    return { message: "Post unliked successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Like a comment - insert into likes table
 */
export const likeComment = async ({ userId, commentId }) => {
  // Check if comment exists
  const commentCheck = await db.query(
    `SELECT id FROM comments WHERE id = $1`,
    [commentId]
  );

  if (!commentCheck.rows[0]) {
    throw new AppError("Comment not found", 404);
  }

  // Check if already liked
  const existingLike = await db.query(
    `SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2`,
    [userId, commentId]
  );

  if (existingLike.rows[0]) {
    throw new AppError("You have already liked this comment", 400);
  }

  // Insert like
  const likeResult = await db.query(
    `INSERT INTO likes (user_id, comment_id)
     VALUES ($1, $2)
     RETURNING id, user_id, comment_id, created_at`,
    [userId, commentId]
  );

  return { like: likeResult.rows[0] };
};

/**
 * Unlike a comment - delete from likes table
 */
export const unlikeComment = async ({ userId, commentId }) => {
  // Check if like exists
  const likeCheck = await db.query(
    `SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2`,
    [userId, commentId]
  );

  if (!likeCheck.rows[0]) {
    throw new AppError("You have not liked this comment", 400);
  }

  // Delete like
  await db.query(
    `DELETE FROM likes WHERE user_id = $1 AND comment_id = $2`,
    [userId, commentId]
  );

  return { message: "Comment unliked successfully" };
};

/**
 * Get users who liked a post with pagination
 */
export const getPostLikers = async ({ postId, limit = 20, offset = 0 }) => {
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
       l.created_at AS liked_at
     FROM likes l
     JOIN users u ON u.id = l.user_id
     WHERE l.post_id = $1
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return { likers: result.rows };
};

/**
 * Get users who liked a comment with pagination
 */
export const getCommentLikers = async ({ commentId, limit = 20, offset = 0 }) => {
  // Check if comment exists
  const commentCheck = await db.query(
    `SELECT id FROM comments WHERE id = $1`,
    [commentId]
  );

  if (!commentCheck.rows[0]) {
    throw new AppError("Comment not found", 404);
  }

  const result = await db.query(
    `SELECT
       u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
       l.created_at AS liked_at
     FROM likes l
     JOIN users u ON u.id = l.user_id
     WHERE l.comment_id = $1
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [commentId, limit, offset]
  );

  return { likers: result.rows };
};

/**
 * Check if user has liked a post or comment
 */
export const checkLikeStatus = async ({ userId, postId, commentId }) => {
  if (!postId && !commentId) {
    throw new AppError("Either postId or commentId is required", 400);
  }

  if (postId && commentId) {
    throw new AppError("Provide either postId or commentId, not both", 400);
  }

  let result;

  if (postId) {
    result = await db.query(
      `SELECT id FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );
  } else {
    result = await db.query(
      `SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );
  }

  return {
    liked: result.rows.length > 0,
    entityType: postId ? "post" : "comment",
    entityId: postId || commentId,
  };
};
