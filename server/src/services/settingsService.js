import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Get user settings (create if not exists)
 */
export const getUserSettings = async ({ userId }) => {
  // Try to get existing settings
  let result = await db.query(
    `SELECT user_id, privacy_settings, notification_settings, created_at, updated_at
     FROM user_settings WHERE user_id = $1`,
    [userId]
  );

  // If no settings exist, create default ones
  if (!result.rows[0]) {
    result = await db.query(
      `INSERT INTO user_settings (user_id)
       VALUES ($1)
       RETURNING user_id, privacy_settings, notification_settings, created_at, updated_at`,
      [userId]
    );
  }

  return { settings: result.rows[0] };
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async ({ userId, privacySettings }) => {
  // Validate privacy settings keys
  const validKeys = [
    "profile_visibility",
    "post_visibility",
    "allow_messages",
    "show_online_status",
  ];

  const providedKeys = Object.keys(privacySettings);
  const invalidKeys = providedKeys.filter((key) => !validKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid privacy setting keys: ${invalidKeys.join(", ")}`,
      400
    );
  }

  // Get current settings or create if not exists
  await getUserSettings({ userId });

  // Update privacy settings
  const result = await db.query(
    `UPDATE user_settings 
     SET privacy_settings = privacy_settings || $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2
     RETURNING user_id, privacy_settings, notification_settings, updated_at`,
    [JSON.stringify(privacySettings), userId]
  );

  return { settings: result.rows[0] };
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async ({
  userId,
  notificationSettings,
}) => {
  // Validate notification settings keys
  const validKeys = [
    "likes",
    "comments",
    "follows",
    "messages",
    "mentions",
    "shares",
  ];

  const providedKeys = Object.keys(notificationSettings);
  const invalidKeys = providedKeys.filter((key) => !validKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new AppError(
      `Invalid notification setting keys: ${invalidKeys.join(", ")}`,
      400
    );
  }

  // Get current settings or create if not exists
  await getUserSettings({ userId });

  // Update notification settings
  const result = await db.query(
    `UPDATE user_settings 
     SET notification_settings = notification_settings || $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2
     RETURNING user_id, privacy_settings, notification_settings, updated_at`,
    [JSON.stringify(notificationSettings), userId]
  );

  return { settings: result.rows[0] };
};

/**
 * Get blocked users list
 */
export const getBlockedUsers = async ({ userId, limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT 
       u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
       b.created_at as blocked_at
     FROM blocked_users b
     INNER JOIN users u ON u.id = b.blocked_id
     WHERE b.blocker_id = $1
     ORDER BY b.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { blockedUsers: result.rows };
};

/**
 * Block a user
 */
export const blockUser = async ({ blockerId, blockedId }) => {
  // Cannot block yourself
  if (blockerId === blockedId) {
    throw new AppError("Cannot block yourself", 400);
  }

  // Check if blocked user exists
  const userCheck = await db.query(`SELECT id FROM users WHERE id = $1`, [
    blockedId,
  ]);

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  // Check if already blocked
  const existingBlock = await db.query(
    `SELECT id FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );

  if (existingBlock.rows[0]) {
    throw new AppError("User is already blocked", 400);
  }

  // Block user
  const result = await db.query(
    `INSERT INTO blocked_users (blocker_id, blocked_id)
     VALUES ($1, $2)
     RETURNING id, blocker_id, blocked_id, created_at`,
    [blockerId, blockedId]
  );

  return { block: result.rows[0] };
};

/**
 * Unblock a user
 */
export const unblockUser = async ({ blockerId, blockedId }) => {
  // Check if block exists
  const blockCheck = await db.query(
    `SELECT id FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );

  if (!blockCheck.rows[0]) {
    throw new AppError("User is not blocked", 400);
  }

  // Unblock user
  await db.query(
    `DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );

  return { message: "User unblocked successfully" };
};

