import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Report a post
 */
export const reportPost = async ({ reporterId, postId, reason, description }) => {
  // Check if post exists
  const postCheck = await db.query(`SELECT id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!postCheck.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  // Check if user has already reported this post
  const existingReport = await db.query(
    `SELECT id FROM reports WHERE reporter_id = $1 AND post_id = $2`,
    [reporterId, postId]
  );

  if (existingReport.rows[0]) {
    throw new AppError("You have already reported this post", 400);
  }

  // Create report
  const result = await db.query(
    `INSERT INTO reports (reporter_id, post_id, reason, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, reporter_id, post_id, reason, description, status, created_at`,
    [reporterId, postId, reason, description]
  );

  return { report: result.rows[0] };
};

/**
 * Report a user
 */
export const reportUser = async ({ reporterId, reportedUserId, reason, description }) => {
  // Check if user exists
  const userCheck = await db.query(`SELECT id FROM users WHERE id = $1`, [
    reportedUserId,
  ]);

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  // Cannot report yourself
  if (reporterId === reportedUserId) {
    throw new AppError("Cannot report yourself", 400);
  }

  // Check if user has already reported this user
  const existingReport = await db.query(
    `SELECT id FROM reports WHERE reporter_id = $1 AND reported_user_id = $2`,
    [reporterId, reportedUserId]
  );

  if (existingReport.rows[0]) {
    throw new AppError("You have already reported this user", 400);
  }

  // Create report
  const result = await db.query(
    `INSERT INTO reports (reporter_id, reported_user_id, reason, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, reporter_id, reported_user_id, reason, description, status, created_at`,
    [reporterId, reportedUserId, reason, description]
  );

  return { report: result.rows[0] };
};

/**
 * Get all reports (admin/mod only)
 */
export const getReports = async ({ status, limit = 20, offset = 0 }) => {
  let query = `
    SELECT 
      r.id, r.reason, r.description, r.status, r.created_at, r.reviewed_at,
      rep.id as reporter_id, rep.username as reporter_username,
      rep.full_name as reporter_name,
      ru.id as reported_user_id, ru.username as reported_username,
      ru.full_name as reported_user_name,
      p.id as post_id, p.content as post_content,
      rev.id as reviewer_id, rev.username as reviewer_username,
      rev.full_name as reviewer_name
    FROM reports r
    LEFT JOIN users rep ON rep.id = r.reporter_id
    LEFT JOIN users ru ON ru.id = r.reported_user_id
    LEFT JOIN posts p ON p.id = r.post_id
    LEFT JOIN users rev ON rev.id = r.reviewed_by
  `;

  const params = [];
  let paramCount = 1;

  // Filter by status if provided
  if (status) {
    query += ` WHERE r.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  return { reports: result.rows };
};

/**
 * Review a report (admin/mod only)
 */
export const reviewReport = async ({ reportId, reviewerId, action }) => {
  // Check if report exists
  const reportCheck = await db.query(
    `SELECT id, status FROM reports WHERE id = $1`,
    [reportId]
  );

  if (!reportCheck.rows[0]) {
    throw new AppError("Report not found", 404);
  }

  if (reportCheck.rows[0].status !== "pending") {
    throw new AppError("Report has already been reviewed", 400);
  }

  // Validate action
  if (!["reviewed", "dismissed"].includes(action)) {
    throw new AppError("Invalid action. Must be 'reviewed' or 'dismissed'", 400);
  }

  // Update report
  const result = await db.query(
    `UPDATE reports 
     SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, status, reviewed_by, reviewed_at`,
    [action, reviewerId, reportId]
  );

  return { report: result.rows[0] };
};

/**
 * Dismiss a report (admin/mod only)
 */
export const dismissReport = async ({ reportId, reviewerId }) => {
  // Check if report exists
  const reportCheck = await db.query(
    `SELECT id, status FROM reports WHERE id = $1`,
    [reportId]
  );

  if (!reportCheck.rows[0]) {
    throw new AppError("Report not found", 404);
  }

  if (reportCheck.rows[0].status !== "pending") {
    throw new AppError("Report has already been processed", 400);
  }

  // Update report
  const result = await db.query(
    `UPDATE reports 
     SET status = 'dismissed', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, status, reviewed_by, reviewed_at`,
    [reviewerId, reportId]
  );

  return { report: result.rows[0] };
};

