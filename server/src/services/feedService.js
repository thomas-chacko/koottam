import db from "../config/db.js";

/**
 * Get home feed - posts from followed users and own posts
 * @param {string} userId - Current user's UUID
 * @param {object} options - Pagination options
 */
export const getHomeFeed = async (userId, { limit = 20, offset = 0, cursor = null } = {}) => {
  const result = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.visibility, p.location,
       p.like_count, p.comment_count, p.share_count, p.view_count,
       p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COALESCE(
         json_agg(h.name ORDER BY h.name) FILTER (WHERE h.name IS NOT NULL),
         '[]'
       ) AS tags,
       EXISTS(
         SELECT 1 FROM likes l 
         WHERE l.post_id = p.id AND l.user_id = $1
       ) AS is_liked,
       EXISTS(
         SELECT 1 FROM bookmarks b 
         WHERE b.post_id = p.id AND b.user_id = $1
       ) AS is_bookmarked
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN post_hashtags ph ON ph.post_id = p.id
     LEFT JOIN hashtags h ON h.id = ph.hashtag_id
     WHERE (
       p.user_id = $1
       OR p.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
     )
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const posts = result.rows.map(
    ({ media_url, username, full_name, avatar_url, is_verified, is_liked, is_bookmarked, ...rest }) => ({
      ...rest,
      media_urls: media_url ? media_url.split(",") : [],
      is_liked: Boolean(is_liked),
      is_bookmarked: Boolean(is_bookmarked),
      author: { username, full_name, avatar_url, is_verified },
    })
  );

  return { 
    posts, 
    total: posts.length,
    nextCursor: posts.length === limit ? offset + limit : null
  };
};

/**
 * Get explore feed - trending posts from users not followed
 * @param {string} userId - Current user's UUID
 * @param {object} options - Pagination options
 */
export const getExploreFeed = async (userId, { limit = 20, offset = 0 } = {}) => {
  const result = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.visibility, p.location,
       p.like_count, p.comment_count, p.share_count, p.view_count,
       p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COALESCE(
         json_agg(h.name ORDER BY h.name) FILTER (WHERE h.name IS NOT NULL),
         '[]'
       ) AS tags,
       EXISTS(
         SELECT 1 FROM likes l 
         WHERE l.post_id = p.id AND l.user_id = $1
       ) AS is_liked,
       EXISTS(
         SELECT 1 FROM bookmarks b 
         WHERE b.post_id = p.id AND b.user_id = $1
       ) AS is_bookmarked,
       (p.like_count + p.comment_count * 2 + p.share_count * 3 + p.view_count * 0.1) AS engagement_score
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN post_hashtags ph ON ph.post_id = p.id
     LEFT JOIN hashtags h ON h.id = ph.hashtag_id
     WHERE p.visibility = 'public'
     AND p.created_at >= NOW() - INTERVAL '7 days'
     AND p.user_id != $1
     AND p.user_id NOT IN (
       SELECT following_id FROM follows WHERE follower_id = $1
     )
     GROUP BY p.id, u.id
     ORDER BY engagement_score DESC, p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const posts = result.rows.map(
    ({ media_url, username, full_name, avatar_url, is_verified, is_liked, is_bookmarked, engagement_score, ...rest }) => ({
      ...rest,
      media_urls: media_url ? media_url.split(",") : [],
      is_liked: Boolean(is_liked),
      is_bookmarked: Boolean(is_bookmarked),
      author: { username, full_name, avatar_url, is_verified },
    })
  );

  return { 
    posts, 
    total: posts.length
  };
};
