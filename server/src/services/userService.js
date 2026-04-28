import db from "../config/db.js";
import AppError from "../utils/AppError.js";

export const getUserProfile = async (username) => {
  const userResult = await db.query(
    `SELECT id, username, email, full_name, bio, avatar_url, cover_url, 
            location, website, role, is_verified,is_active,is_private,email_verified,followers_count,following_count,posts_count,created_at 
     FROM users 
     WHERE username = $1`,
    [username],
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return { user };
};
