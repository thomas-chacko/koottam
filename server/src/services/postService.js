import db from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * Create a new post.
 * Runs as a single atomic transaction:
 *   1. Insert post row
 *   2. Increment users.posts_count
 *   3. Upsert hashtags + link via post_hashtags
 *   4. Return full post with author details
 *
 * @param {object} params
 * @param {string} params.userId       - Authenticated user's UUID
 * @param {string} params.content      - Post body text
 * @param {string[]} params.mediaUrls  - Array of Cloudinary URLs (0-4)
 * @param {string} params.visibility   - 'public' | 'followers' | 'private'
 * @param {string[]} params.tags       - Array of tag strings without '#'
 */
export const createPost = async ({
  userId,
  content,
  mediaUrls = [],
  visibility = "public",
  tags = [],
  location = null,
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // ── Step 1: Insert the post ──────────────────────────────────────────
    // media_url stores multiple URLs as a comma-separated string
    const mediaUrlString = mediaUrls.length > 0 ? mediaUrls.join(",") : null;

    const postResult = await client.query(
      `INSERT INTO posts (user_id, content, media_url, visibility, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, content, media_url, visibility, location,
                 like_count, comment_count, share_count, view_count,
                 created_at, updated_at`,
      [userId, content, mediaUrlString, visibility, location],
    );

    const post = postResult.rows[0];

    // ── Step 2: Increment user's posts_count ────────────────────────────
    await client.query(
      `UPDATE users
       SET posts_count = posts_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId],
    );

    // ── Step 3: Process hashtags ─────────────────────────────────────────
    const processedTags = [];

    for (const tag of tags) {
      // Normalize: lowercase, strip leading # just in case
      const normalizedTag = tag.toLowerCase().replace(/^#/, "").trim();
      if (!normalizedTag) continue;

      // Upsert: create the hashtag if it doesn't exist, always get the id
      const hashtagResult = await client.query(
        `INSERT INTO hashtags (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE
           SET post_count = hashtags.post_count + 1
         RETURNING id, name, post_count`,
        [normalizedTag],
      );

      // If this was a brand-new hashtag the ON CONFLICT branch won't fire,
      // so we increment separately for the fresh-insert case
      const hashtag = hashtagResult.rows[0];

      // For a new row the trigger didn't fire; bump it to 1 explicitly
      // (The ON CONFLICT SET already increments for existing rows)
      if (hashtag.post_count === 0) {
        await client.query(`UPDATE hashtags SET post_count = 1 WHERE id = $1`, [
          hashtag.id,
        ]);
      }

      // Link post ↔ hashtag
      await client.query(
        `INSERT INTO post_hashtags (post_id, hashtag_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [post.id, hashtag.id],
      );

      processedTags.push(normalizedTag);
    }

    // ── Step 4: Fetch author details for the response ────────────────────
    const authorResult = await client.query(
      `SELECT id, username, full_name, avatar_url, is_verified
       FROM users
       WHERE id = $1`,
      [userId],
    );

    await client.query("COMMIT");

    const author = authorResult.rows[0];

    const { media_url, ...postRest } = post;

    return {
      post: {
        ...postRest,
        media_urls: media_url ? media_url.split(",") : [],
        tags: processedTags,
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
 * Get a single post by ID with author + tags.
 */
export const getPostById = async (postId) => {
  const postResult = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.visibility, p.location,
       p.like_count, p.comment_count, p.share_count, p.view_count,
       p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1`,
    [postId],
  );

  if (!postResult.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  const row = postResult.rows[0];

  // Fetch associated hashtags
  const tagResult = await db.query(
    `SELECT h.name
     FROM post_hashtags ph
     JOIN hashtags h ON h.id = ph.hashtag_id
     WHERE ph.post_id = $1`,
    [postId],
  );

  return {
    post: {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      media_urls: row.media_url ? row.media_url.split(",") : [],
      visibility: row.visibility,
      like_count: row.like_count,
      comment_count: row.comment_count,
      share_count: row.share_count,
      view_count: row.view_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: tagResult.rows.map((t) => t.name),
      author: {
        username: row.username,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        is_verified: row.is_verified,
      },
    },
  };
};

/**
 * Delete a post — only the owner can delete.
 */
export const deletePost = async ({ postId, userId }) => {
  // Verify ownership
  const check = await db.query(`SELECT id, user_id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!check.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  if (check.rows[0].user_id !== userId) {
    throw new AppError("You are not authorized to delete this post", 403);
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Delete post (CASCADE handles post_hashtags, likes, comments, etc.)
    await client.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    // Decrement user's posts_count (floor at 0)
    await client.query(
      `UPDATE users
       SET posts_count = GREATEST(posts_count - 1, 0),
           updated_at  = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId],
    );

    await client.query("COMMIT");
    return { message: "Post deleted successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update an existing post — only the owner can edit.
 * All fields (content, mediaUrls, visibility, tags) are optional;
 * at least one must be provided. Tags are fully replaced when supplied.
 */
export const updatePost = async ({
  postId,
  userId,
  content,
  mediaUrls,
  visibility,
  tags,
  location,
}) => {
  // ── Verify existence & ownership before opening a transaction ───────────
  const check = await db.query(`SELECT id, user_id FROM posts WHERE id = $1`, [
    postId,
  ]);

  if (!check.rows[0]) {
    throw new AppError("Post not found", 404);
  }

  if (check.rows[0].user_id !== userId) {
    throw new AppError("You are not authorized to edit this post", 403);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // ── Step 1: Build dynamic UPDATE for posts ───────────────────────────
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }

    if (mediaUrls !== undefined) {
      const mediaUrlString = mediaUrls.length > 0 ? mediaUrls.join(",") : null;
      updates.push(`media_url = $${paramCount++}`);
      values.push(mediaUrlString);
    }

    if (visibility !== undefined) {
      updates.push(`visibility = $${paramCount++}`);
      values.push(visibility);
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(postId); // WHERE id = $N

    const postResult = await client.query(
      `UPDATE posts
       SET ${updates.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, user_id, content, media_url, visibility, location,
                 like_count, comment_count, share_count, view_count,
                 created_at, updated_at`,
      values,
    );

    const post = postResult.rows[0];

    // ── Step 2: Replace hashtags (only if tags were supplied) ────────────
    let processedTags = null; // null means "tags not touched this request"

    if (tags !== undefined) {
      processedTags = [];

      // Decrement post_count for every currently linked tag
      const oldTagsResult = await client.query(
        `SELECT h.id FROM post_hashtags ph
         JOIN hashtags h ON h.id = ph.hashtag_id
         WHERE ph.post_id = $1`,
        [postId],
      );

      for (const { id } of oldTagsResult.rows) {
        await client.query(
          `UPDATE hashtags SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1`,
          [id],
        );
      }

      // Remove old junction rows
      await client.query(`DELETE FROM post_hashtags WHERE post_id = $1`, [
        postId,
      ]);

      // Upsert new tags and re-link
      for (const tag of tags) {
        const normalizedTag = tag.toLowerCase().replace(/^#/, "").trim();
        if (!normalizedTag) continue;

        const hashtagResult = await client.query(
          `INSERT INTO hashtags (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE
             SET post_count = hashtags.post_count + 1
           RETURNING id, post_count`,
          [normalizedTag],
        );

        const hashtag = hashtagResult.rows[0];

        if (hashtag.post_count === 0) {
          await client.query(
            `UPDATE hashtags SET post_count = 1 WHERE id = $1`,
            [hashtag.id],
          );
        }

        await client.query(
          `INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [post.id, hashtag.id],
        );

        processedTags.push(normalizedTag);
      }
    } else {
      // Tags not updated — fetch current ones for the response
      const existingTagsResult = await client.query(
        `SELECT h.name FROM post_hashtags ph
         JOIN hashtags h ON h.id = ph.hashtag_id
         WHERE ph.post_id = $1`,
        [postId],
      );
      processedTags = existingTagsResult.rows.map((r) => r.name);
    }

    // ── Step 3: Fetch author for the response ─────────────────────────────
    const authorResult = await client.query(
      `SELECT id, username, full_name, avatar_url, is_verified FROM users WHERE id = $1`,
      [userId],
    );

    await client.query("COMMIT");

    const author = authorResult.rows[0];
    const { media_url, ...postRest } = post;

    return {
      post: {
        ...postRest,
        media_urls: media_url ? media_url.split(",") : [],
        tags: processedTags,
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
 * Get all posts for a user by username, newest first.
 * @param {string} username
 * @param {{ limit?: number, offset?: number }} options
 */
export const getUserPosts = async (
  username,
  { limit = 20, offset = 0 } = {},
) => {
  // Resolve user by username first
  const userResult = await db.query(
    `SELECT id FROM users WHERE username = $1`,
    [username],
  );

  if (!userResult.rows[0]) {
    throw new AppError("User not found", 404);
  }

  const userId = userResult.rows[0].id;

  const postsResult = await db.query(
    `SELECT
       p.id, p.user_id, p.content, p.media_url, p.visibility, p.location,
       p.like_count, p.comment_count, p.share_count, p.view_count,
       p.created_at, p.updated_at,
       u.username, u.full_name, u.avatar_url, u.is_verified,
       COALESCE(
         json_agg(h.name ORDER BY h.name) FILTER (WHERE h.name IS NOT NULL),
         '[]'
       ) AS tags
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN post_hashtags ph ON ph.post_id = p.id
     LEFT JOIN hashtags h ON h.id = ph.hashtag_id
     WHERE p.user_id = $1
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  const posts = postsResult.rows.map(
    ({ media_url, username, full_name, avatar_url, is_verified, ...rest }) => ({
      ...rest,
      media_urls: media_url ? media_url.split(",") : [],
      author: { username, full_name, avatar_url, is_verified },
    }),
  );

  return { posts, total: posts.length };
};
