import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Get user notifications with pagination
 */
export const getUserNotifications = async ({ userId, limit = 20, offset = 0, type }) => {
  let query = `
    SELECT
      n.id, n.type, n.entity_id, n.entity_type, n.is_read, n.created_at,
      u.id AS actor_id, u.username AS actor_username, u.full_name AS actor_full_name,
      u.avatar_url AS actor_avatar_url, u.is_verified AS actor_is_verified
    FROM notifications n
    LEFT JOIN users u ON u.id = n.actor_id
    WHERE n.user_id = $1
  `;

  const params = [userId];

  // Optional filter by type
  if (type) {
    query += ` AND n.type = $${params.length + 1}`;
    params.push(type);
  }

  query += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  return { notifications: result.rows };
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async ({ userId, notificationId }) => {
  // Check if notification exists and belongs to user
  const notificationCheck = await db.query(
    `SELECT id FROM notifications WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );

  if (!notificationCheck.rows[0]) {
    throw new AppError("Notification not found", 404);
  }

  // Update notification
  await db.query(
    `UPDATE notifications SET is_read = true WHERE id = $1`,
    [notificationId]
  );

  return { message: "Notification marked as read" };
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async ({ userId }) => {
  const result = await db.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );

  return {
    message: "All notifications marked as read",
    updatedCount: result.rowCount,
  };
};

/**
 * Delete a notification
 */
export const deleteNotification = async ({ userId, notificationId }) => {
  // Check if notification exists and belongs to user
  const notificationCheck = await db.query(
    `SELECT id FROM notifications WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );

  if (!notificationCheck.rows[0]) {
    throw new AppError("Notification not found", 404);
  }

  // Delete notification
  await db.query(`DELETE FROM notifications WHERE id = $1`, [notificationId]);

  return { message: "Notification deleted successfully" };
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async ({ userId }) => {
  const result = await db.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );

  return { unreadCount: parseInt(result.rows[0].count) };
};

/**
 * Create a notification (helper function for other services)
 */
export const createNotification = async ({
  userId,
  actorId,
  type,
  entityId,
  entityType,
}) => {
  // Don't create notification if actor is the same as the recipient
  if (userId === actorId) {
    return null;
  }

  const result = await db.query(
    `INSERT INTO notifications (user_id, actor_id, type, entity_id, entity_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, actor_id, type, entity_id, entity_type, is_read, created_at`,
    [userId, actorId, type, entityId, entityType]
  );

  return result.rows[0];
};
