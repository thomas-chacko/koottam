import db from "../config/db.js";

export const performGlobalSearch = async (searchQuery) => {
  const searchTerm = `%${searchQuery}%`;

  // 1. Search Users
  const userResult = await db.query(
    `SELECT 
      id, username, full_name, avatar_url, is_verified
     FROM users 
     WHERE username ILIKE $1 OR full_name ILIKE $1
     LIMIT 20`,
    [searchTerm],
  );

  // 2. Future: Search Posts
  // const postResult = await db.query(...);

  // 3. Future: Search Locations/Hashtags
  // const locationResult = await db.query(...);

  return {
    users: userResult.rows,
    posts: [], // Placeholder for future implementation
    locations: [], // Placeholder for future implementation
  };
};
