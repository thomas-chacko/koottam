import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Follow a user
 * @param {string} followerId - UUID of the user who is following
 * @param {string} followingId - UUID of the user being followed
 */
export const followUser = async (followerId, followingId) => {
  // Check if trying to follow self
  if (followerId === followingId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  // Check if following_id user exists
  const userExists = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [followingId]
  );

  if (!userExists.rows[0]) {
    throw new AppError("User not found", 404);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if already following
    const existing = await client.query(
      `SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    if (existing.rows[0]) {
      throw new AppError("You are already following this user", 400);
    }

    // Insert follow record
    const followResult = await client.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       RETURNING id, follower_id, following_id, created_at`,
      [followerId, followingId]
    );

    // Increment following_count for the follower
    await client.query(
      `UPDATE users
       SET following_count = following_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [followerId]
    );

    // Increment followers_count for the user being followed
    await client.query(
      `UPDATE users
       SET followers_count = followers_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [followingId]
    );

    await client.query("COMMIT");

    return {
      follow: followResult.rows[0]
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Unfollow a user
 * @param {string} followerId - UUID of the user who is unfollowing
 * @param {string} followingId - UUID of the user being unfollowed
 */
export const unfollowUser = async (followerId, followingId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if follow relationship exists
    const existing = await client.query(
      `SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    if (!existing.rows[0]) {
      throw new AppError("You are not following this user", 400);
    }

    // Delete follow record
    await client.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    // Decrement following_count for the follower (floor at 0)
    await client.query(
      `UPDATE users
       SET following_count = GREATEST(following_count - 1, 0), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [followerId]
    );

    // Decrement followers_count for the user being unfollowed (floor at 0)
    await client.query(
      `UPDATE users
       SET followers_count = GREATEST(followers_count - 1, 0), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [followingId]
    );

    await client.query("COMMIT");

    return {
      message: "User unfollowed successfully"
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get followers of a user
 * @param {string} userId - UUID of the user whose followers to fetch
 * @param {object} options - Pagination options
 */
export const getFollowers = async (userId, { limit = 20, offset = 0 } = {}) => {
  // Check if user exists
  const userExists = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [userId]
  );

  if (!userExists.rows[0]) {
    throw new AppError("User not found", 404);
  }

  const result = await db.query(
    `SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified, f.created_at
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    followers: result.rows,
    total: result.rows.length
  };
};

/**
 * Get users that a user is following
 * @param {string} userId - UUID of the user whose following list to fetch
 * @param {object} options - Pagination options
 */
export const getFollowing = async (userId, { limit = 20, offset = 0 } = {}) => {
  // Check if user exists
  const userExists = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [userId]
  );

  if (!userExists.rows[0]) {
    throw new AppError("User not found", 404);
  }

  const result = await db.query(
    `SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified, f.created_at
     FROM follows f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    following: result.rows,
    total: result.rows.length
  };
};

/**
 * Check if current user is following a specific user
 * @param {string} followerId - Current user's UUID
 * @param {string} followingId - Target user's UUID
 */
export const checkFollowStatus = async (followerId, followingId) => {
  const result = await db.query(
    `SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );

  return {
    isFollowing: result.rows.length > 0
  };
};

/**
 * Get suggested users to follow
 * @param {string} userId - Current user's UUID
 * @param {number} limit - Number of suggestions to return
 */
export const getSuggestedUsers = async (userId, limit = 10) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified, u.followers_count
     FROM users u
     WHERE u.id != $1
     AND u.id NOT IN (
       SELECT following_id FROM follows WHERE follower_id = $1
     )
     ORDER BY u.followers_count DESC, RANDOM()
     LIMIT $2`,
    [userId, limit]
  );

  return {
    suggestions: result.rows
  };
};
