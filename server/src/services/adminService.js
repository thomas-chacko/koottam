import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Get all users (paginated with optional filters)
 */
export const getAllUsers = async ({ limit = 20, offset = 0, role, isActive, search }) => {
  let query = `
    SELECT 
      id, username, email, full_name, avatar_url, bio, role, 
      is_verified, is_active, is_private, email_verified,
      followers_count, following_count, posts_count, last_seen,
      created_at, updated_at
    FROM users
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Filter by role
  if (role) {
    query += ` AND role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  // Filter by active status
  if (isActive !== undefined) {
    query += ` AND is_active = $${paramCount}`;
    params.push(isActive);
    paramCount++;
  }

  // Search by username, email, or full_name
  if (search) {
    query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  // Get total count
  let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
  const countParams = [];
  let countParamCount = 1;

  if (role) {
    countQuery += ` AND role = $${countParamCount}`;
    countParams.push(role);
    countParamCount++;
  }

  if (isActive !== undefined) {
    countQuery += ` AND is_active = $${countParamCount}`;
    countParams.push(isActive);
    countParamCount++;
  }

  if (search) {
    countQuery += ` AND (username ILIKE $${countParamCount} OR email ILIKE $${countParamCount} OR full_name ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
  }

  const countResult = await db.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  return {
    users: result.rows,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
  // Get user stats
  const userStats = await db.query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE is_active = true) as active_users,
      COUNT(*) FILTER (WHERE is_verified = true) as verified_users,
      COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
      COUNT(*) FILTER (WHERE role = 'moderator') as moderator_count,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d
    FROM users
  `);

  // Get post stats
  const postStats = await db.query(`
    SELECT 
      COUNT(*) as total_posts,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as posts_24h,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as posts_7d,
      SUM(like_count) as total_likes,
      SUM(comment_count) as total_comments,
      SUM(share_count) as total_shares,
      SUM(view_count) as total_views
    FROM posts
  `);

  // Get engagement stats
  const engagementStats = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM likes) as total_likes,
      (SELECT COUNT(*) FROM comments) as total_comments,
      (SELECT COUNT(*) FROM shares) as total_shares,
      (SELECT COUNT(*) FROM bookmarks) as total_bookmarks,
      (SELECT COUNT(*) FROM follows) as total_follows
  `);

  // Get message stats
  const messageStats = await db.query(`
    SELECT 
      COUNT(*) as total_conversations,
      (SELECT COUNT(*) FROM messages) as total_messages,
      (SELECT COUNT(*) FROM messages WHERE created_at >= NOW() - INTERVAL '24 hours') as messages_24h
    FROM conversations
  `);

  // Get report stats
  const reportStats = await db.query(`
    SELECT 
      COUNT(*) as total_reports,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_reports,
      COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_reports
    FROM reports
  `);

  return {
    users: userStats.rows[0],
    posts: postStats.rows[0],
    engagement: engagementStats.rows[0],
    messages: messageStats.rows[0],
    reports: reportStats.rows[0],
  };
};

/**
 * Verify user account
 */
export const verifyUser = async ({ userId }) => {
  // Check if user exists
  const userCheck = await db.query(
    `SELECT id, is_verified FROM users WHERE id = $1`,
    [userId]
  );

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  if (userCheck.rows[0].is_verified) {
    throw new AppError("User is already verified", 400);
  }

  // Update user
  const result = await db.query(
    `UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, username, is_verified, updated_at`,
    [userId]
  );

  return { user: result.rows[0] };
};

/**
 * Suspend user account
 */
export const suspendUser = async ({ userId, reason }) => {
  // Check if user exists
  const userCheck = await db.query(
    `SELECT id, is_active, role FROM users WHERE id = $1`,
    [userId]
  );

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  // Cannot suspend admins
  if (userCheck.rows[0].role === "admin") {
    throw new AppError("Cannot suspend admin users", 403);
  }

  if (!userCheck.rows[0].is_active) {
    throw new AppError("User is already suspended", 400);
  }

  // Update user
  const result = await db.query(
    `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, username, is_active, updated_at`,
    [userId]
  );

  return { user: result.rows[0], reason };
};

/**
 * Activate user account
 */
export const activateUser = async ({ userId }) => {
  // Check if user exists
  const userCheck = await db.query(
    `SELECT id, is_active FROM users WHERE id = $1`,
    [userId]
  );

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  if (userCheck.rows[0].is_active) {
    throw new AppError("User is already active", 400);
  }

  // Update user
  const result = await db.query(
    `UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, username, is_active, updated_at`,
    [userId]
  );

  return { user: result.rows[0] };
};

/**
 * Update user role
 */
export const updateUserRole = async ({ userId, newRole }) => {
  // Validate role
  if (!["user", "admin", "moderator"].includes(newRole)) {
    throw new AppError("Invalid role. Must be 'user', 'admin', or 'moderator'", 400);
  }

  // Check if user exists
  const userCheck = await db.query(
    `SELECT id, role FROM users WHERE id = $1`,
    [userId]
  );

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  if (userCheck.rows[0].role === newRole) {
    throw new AppError(`User already has role: ${newRole}`, 400);
  }

  // Update user role
  const result = await db.query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, username, role, updated_at`,
    [newRole, userId]
  );

  return { user: result.rows[0] };
};

/**
 * Delete any post (moderator action)
 */
export const deleteAnyPost = async ({ postId, deletedBy, reason }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if post exists
    const postCheck = await client.query(
      `SELECT id, user_id FROM posts WHERE id = $1`,
      [postId]
    );

    if (!postCheck.rows[0]) {
      throw new AppError("Post not found", 404);
    }

    const postUserId = postCheck.rows[0].user_id;

    // Delete post (cascade will handle related data)
    await client.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    // Decrement user's posts_count
    await client.query(
      `UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = $1`,
      [postUserId]
    );

    await client.query("COMMIT");

    return {
      message: "Post deleted successfully",
      postId,
      deletedBy,
      reason,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

