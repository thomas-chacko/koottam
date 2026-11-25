import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Get trending hashtags ordered by post count
 */
export const getTrendingHashtags = async ({ limit = 10 }) => {
  const result = await db.query(
    `SELECT id, name, post_count, created_at
     FROM hashtags
     ORDER BY post_count DESC, created_at DESC
     LIMIT $1`,
    [limit]
  );

  return { hashtags: result.rows };
};

/**
 * Get posts containing a specific hashtag
 */
export const getPostsByHashtag = async ({ hashtag, limit = 20, offset = 0 }) => {
  // Remove # if present
  const cleanHashtag = hashtag.startsWith("#") ? hashtag.slice(1) : hashtag;

  // Check if hashtag exists
  const hashtagCheck = await db.query(
    `SELECT id FROM hashtags WHERE name = $1`,
    [cleanHashtag]
  );

  if (!hashtagCheck.rows[0]) {
    throw new AppError("Hashtag not found", 404);
  }

  const result = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.location,
       p.visibility, p.view_count, p.like_count, p.comment_count,
       p.share_count, p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified
     FROM posts p
     JOIN users u ON u.id = p.user_id
     JOIN post_hashtags ph ON ph.post_id = p.id
     JOIN hashtags h ON h.id = ph.hashtag_id
     WHERE h.name = $1 AND p.visibility = 'public'
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [cleanHashtag, limit, offset]
  );

  return {
    hashtag: cleanHashtag,
    posts: result.rows,
  };
};

/**
 * Search hashtags by name
 */
export const searchHashtags = async ({ query, limit = 10 }) => {
  // Remove # if present
  const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

  const result = await db.query(
    `SELECT id, name, post_count, created_at
     FROM hashtags
     WHERE name ILIKE $1
     ORDER BY post_count DESC, created_at DESC
     LIMIT $2`,
    [`%${cleanQuery}%`, limit]
  );

  return { hashtags: result.rows };
};

/**
 * Extract and save hashtags from post content (helper function)
 */
export const extractAndSaveHashtags = async ({ postId, content }) => {
  if (!content) return;

  // Extract hashtags from content (matches #word)
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);

  if (!matches || matches.length === 0) return;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const match of matches) {
      const hashtagName = match.slice(1).toLowerCase(); // Remove # and convert to lowercase

      // Insert or get existing hashtag
      const hashtagResult = await client.query(
        `INSERT INTO hashtags (name, post_count)
         VALUES ($1, 0)
         ON CONFLICT (name) DO UPDATE SET name = hashtags.name
         RETURNING id`,
        [hashtagName]
      );

      const hashtagId = hashtagResult.rows[0].id;

      // Link post to hashtag
      await client.query(
        `INSERT INTO post_hashtags (post_id, hashtag_id)
         VALUES ($1, $2)
         ON CONFLICT (post_id, hashtag_id) DO NOTHING`,
        [postId, hashtagId]
      );

      // Increment hashtag post_count
      await client.query(
        `UPDATE hashtags SET post_count = (
           SELECT COUNT(*) FROM post_hashtags WHERE hashtag_id = $1
         ) WHERE id = $1`,
        [hashtagId]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
