import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Create a new comment or reply
 */
export const createComment = async ({ userId, postId, content, parentId }) => {
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

    // If parentId is provided, verify it exists and belongs to the same post
    if (parentId) {
      const parentCheck = await client.query(
        `SELECT id, post_id FROM comments WHERE id = $1`,
        [parentId]
      );

      if (!parentCheck.rows[0]) {
        throw new AppError("Parent comment not found", 404);
      }

      if (parentCheck.rows[0].post_id !== postId) {
        throw new AppError(
          "Parent comment does not belong to this post",
          400
        );
      }
    }

    // Insert comment
    const commentResult = await client.query(
      `INSERT INTO comments (post_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, user_id, parent_id, content, created_at, updated_at`,
      [postId, userId, parentId, content]
    );

    const comment = commentResult.rows[0];

    // Increment post comment_count
    await client.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [postId]
    );

    // Get author details
    const authorResult = await client.query(
      `SELECT id, username, full_name, avatar_url, is_verified
       FROM users WHERE id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    const author = authorResult.rows[0];

    return {
      comment: {
        ...comment,
        author: {
          id: author.id,
          username: author.username,
          full_name: author.full_name,
          avatar_url: author.avatar_url,
          is_verified: author.is_verified,
        },
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update a comment - owner only
 */
export const updateComment = async ({ commentId, userId, content }) => {
  // Check if comment exists and verify ownership
  const commentCheck = await db.query(
    `SELECT id, user_id FROM comments WHERE id = $1`,
    [commentId]
  );

  if (!commentCheck.rows[0]) {
    throw new AppError("Comment not found", 404);
  }

  if (commentCheck.rows[0].user_id !== userId) {
    throw new AppError("You are not authorized to update this comment", 403);
  }

  // Update comment
  const result = await db.query(
    `UPDATE comments
     SET content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, post_id, user_id, parent_id, content, created_at, updated_at`,
    [content, commentId]
  );

  // Get author details
  const authorResult = await db.query(
    `SELECT id, username, full_name, avatar_url, is_verified
     FROM users WHERE id = $1`,
    [userId]
  );

  const comment = result.rows[0];
  const author = authorResult.rows[0];

  return {
    comment: {
      ...comment,
      author: {
        id: author.id,
        username: author.username,
        full_name: author.full_name,
        avatar_url: author.avatar_url,
        is_verified: author.is_verified,
      },
    },
  };
};

/**
 * Delete a comment - owner only, with CASCADE for replies
 */
export const deleteComment = async ({ commentId, userId }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if comment exists and verify ownership
    const commentCheck = await client.query(
      `SELECT id, user_id, post_id FROM comments WHERE id = $1`,
      [commentId]
    );

    if (!commentCheck.rows[0]) {
      throw new AppError("Comment not found", 404);
    }

    if (commentCheck.rows[0].user_id !== userId) {
      throw new AppError("You are not authorized to delete this comment", 403);
    }

    const postId = commentCheck.rows[0].post_id;

    // Count how many comments will be deleted (parent + all nested replies)
    const countResult = await client.query(
      `WITH RECURSIVE comment_tree AS (
         SELECT id FROM comments WHERE id = $1
         UNION
         SELECT c.id FROM comments c
         INNER JOIN comment_tree ct ON c.parent_id = ct.id
       )
       SELECT COUNT(*) as total FROM comment_tree`,
      [commentId]
    );

    const deleteCount = parseInt(countResult.rows[0].total);

    // Delete comment (CASCADE will handle replies via foreign key)
    await client.query(`DELETE FROM comments WHERE id = $1`, [commentId]);

    // Decrement post comment_count
    await client.query(
      `UPDATE posts
       SET comment_count = GREATEST(comment_count - $1, 0)
       WHERE id = $2`,
      [deleteCount, postId]
    );

    await client.query("COMMIT");

    return { message: "Comment deleted successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get top-level comments for a post with pagination
 */
export const getPostComments = async ({ postId, limit = 20, offset = 0 }) => {
  // Check if post exists
  const postCheck = await db.query(`SELECT id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!postCheck.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  const result = await db.query(
    `SELECT
       c.id, c.post_id, c.user_id, c.parent_id, c.content,
       c.created_at, c.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COUNT(DISTINCT r.id) AS reply_count,
       COUNT(DISTINCT l.id) AS like_count
     FROM comments c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN comments r ON r.parent_id = c.id
     LEFT JOIN likes l ON l.comment_id = c.id
     WHERE c.post_id = $1 AND c.parent_id IS NULL
     GROUP BY c.id, u.id
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  const comments = result.rows.map(
    ({ username, full_name, avatar_url, is_verified, ...rest }) => ({
      ...rest,
      reply_count: parseInt(rest.reply_count),
      like_count: parseInt(rest.like_count),
      author: {
        username,
        full_name,
        avatar_url,
        is_verified,
      },
    })
  );

  return { comments };
};

/**
 * Get replies to a comment with pagination
 */
export const getCommentReplies = async ({ commentId, limit = 20, offset = 0 }) => {
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
       c.id, c.post_id, c.user_id, c.parent_id, c.content,
       c.created_at, c.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COUNT(DISTINCT l.id) AS like_count
     FROM comments c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN likes l ON l.comment_id = c.id
     WHERE c.parent_id = $1
     GROUP BY c.id, u.id
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [commentId, limit, offset]
  );

  const replies = result.rows.map(
    ({ username, full_name, avatar_url, is_verified, ...rest }) => ({
      ...rest,
      like_count: parseInt(rest.like_count),
      author: {
        username,
        full_name,
        avatar_url,
        is_verified,
      },
    })
  );

  return { replies };
};

/**
 * Get a single comment by ID with author details
 */
export const getComment = async ({ commentId }) => {
  const result = await db.query(
    `SELECT
       c.id, c.post_id, c.user_id, c.parent_id, c.content,
       c.created_at, c.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COUNT(DISTINCT r.id) AS reply_count,
       COUNT(DISTINCT l.id) AS like_count
     FROM comments c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN comments r ON r.parent_id = c.id
     LEFT JOIN likes l ON l.comment_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, u.id`,
    [commentId]
  );

  if (!result.rows[0]) {
    throw new AppError("Comment not found", 404);
  }

  const { username, full_name, avatar_url, is_verified, ...rest } =
    result.rows[0];

  return {
    comment: {
      ...rest,
      reply_count: parseInt(rest.reply_count),
      like_count: parseInt(rest.like_count),
      author: {
        username,
        full_name,
        avatar_url,
        is_verified,
      },
    },
  };
};
