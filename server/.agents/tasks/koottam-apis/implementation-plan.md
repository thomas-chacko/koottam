# Implementation Plan: Koottam REST APIs

This plan implements all High Priority and Medium Priority REST APIs for the Koottam social media platform.

## Implementation Order

The work is organized into 5 features (FEAT-001 through FEAT-005) that should be implemented sequentially. Each feature is independent and can be verified separately.

---

## FEAT-001: Likes and Comments APIs

**What to do:** Implement full CRUD operations for likes (posts and comments) and comments (with nested replies support). Include like/unlike operations, likers lists, comment CRUD, reply support, and proper counter updates.

**Files to create:**
- `src/controllers/likeController.js` - Like/unlike handlers for posts and comments
- `src/services/likeService.js` - Like business logic with transactions
- `src/routes/likeRoutes.js` - Like routes
- `src/controllers/commentController.js` - Comment CRUD and reply handlers
- `src/services/commentService.js` - Comment business logic with transactions
- `src/routes/commentRoutes.js` - Comment routes

**Files to modify:**
- `src/routes/index.js` - Register like and comment routes

**Verification:** Run `npm test` to ensure all tests pass. Manual testing: POST to `/api/v1/like/post/:postId` with auth token should increment like_count. POST to `/api/v1/comment/:postId` should create comment and increment comment_count.

---

## FEAT-002: Follow System and Feed APIs

**What to do:** Implement follow/unfollow operations, followers/following lists, follow suggestions, follow status checks, personalized home feed (chronological from followed users), and explore feed (trending posts from non-followed users).

**Files to create:**
- `src/controllers/followController.js` - Follow/unfollow and list handlers
- `src/services/followService.js` - Follow business logic with counter updates
- `src/routes/followRoutes.js` - Follow routes
- `src/controllers/feedController.js` - Home and explore feed handlers
- `src/services/feedService.js` - Feed query logic with engagement scoring
- `src/routes/feedRoutes.js` - Feed routes

**Files to modify:**
- `src/routes/index.js` - Register follow and feed routes

**Verification:** Run `npm test`. Manual testing: POST to `/api/v1/follow/:userId` should increment follower/following counts. GET `/api/v1/feed/home` should return posts from followed users only. GET `/api/v1/feed/explore` should return trending posts.

---

## FEAT-003: Bookmarks, Shares, and Post Views APIs

**What to do:** Implement bookmark/unbookmark posts, get bookmarked posts list, share/unshare posts with sharers lists, and post view tracking (idempotent - one view per user per post per day).

**Files to create:**
- `src/controllers/bookmarkController.js` - Bookmark handlers
- `src/services/bookmarkService.js` - Bookmark business logic
- `src/routes/bookmarkRoutes.js` - Bookmark routes
- `src/controllers/shareController.js` - Share handlers
- `src/services/shareService.js` - Share business logic with counter updates
- `src/routes/shareRoutes.js` - Share routes
- `src/controllers/viewController.js` - View tracking handlers
- `src/services/viewService.js` - View tracking with duplicate prevention
- `src/routes/viewRoutes.js` - View routes

**Files to modify:**
- `src/routes/index.js` - Register bookmark, share, and view routes

**Verification:** Run `npm test`. Manual testing: POST to `/api/v1/bookmark/:postId` should bookmark post. Second attempt should fail due to UNIQUE constraint. POST to `/api/v1/share/:postId` should increment share_count. POST to `/api/v1/view/:postId` should increment view_count only on first view per day.

---

## FEAT-004: Notifications System

**What to do:** Implement notifications system with get, filter (all/unread), mark read/unread, mark all read, delete, clear all, unread count, and automatic notification creation when users like, comment, follow, or share. Integrate notification creation into existing services.

**Files to create:**
- `src/controllers/notificationController.js` - Notification handlers
- `src/services/notificationService.js` - Notification query logic
- `src/routes/notificationRoutes.js` - Notification routes
- `src/services/notificationHelper.js` - Helper function for creating notifications

**Files to modify:**
- `src/routes/index.js` - Register notification routes
- `src/services/likeService.js` - Add notification creation on like
- `src/services/commentService.js` - Add notification creation on comment
- `src/services/followService.js` - Add notification creation on follow
- `src/services/shareService.js` - Add notification creation on share

**Verification:** Run `npm test`. Manual testing: Like a post as User A, verify User B (post owner) receives notification. GET `/api/v1/notification?filter=unread` should return only unread notifications. PUT `/api/v1/notification/:id/read` should mark as read.

---

## FEAT-005: Stories and Hashtags APIs

**What to do:** Implement stories with 24-hour auto-expire, story feeds, view tracking, delete stories, and story viewers list (owner-only). Implement hashtag details, trending hashtags (last 7 days), posts by hashtag, and hashtag search.

**Files to create:**
- `src/controllers/storyController.js` - Story CRUD and view handlers
- `src/services/storyService.js` - Story business logic with expiry filtering
- `src/routes/storyRoutes.js` - Story routes
- `src/controllers/hashtagController.js` - Hashtag handlers
- `src/services/hashtagService.js` - Hashtag query logic
- `src/routes/hashtagRoutes.js` - Hashtag routes

**Files to modify:**
- `src/routes/index.js` - Register story and hashtag routes

**Verification:** Run `npm test`. Manual testing: POST to `/api/v1/story` should create story with expires_at 24 hours in future. GET `/api/v1/story/feed` should return only non-expired stories from followed users. GET `/api/v1/hashtag/trending` should return top hashtags from last 7 days. GET `/api/v1/hashtag/:name/posts` should return posts with that tag.

---

## Digest

### Key Patterns to Follow

**Controllers:**
- Use `asyncHandler` wrapper for all handlers
- Throw `AppError(message, statusCode)` for errors
- Return `successResponse(res, statusCode, message, data)` for success
- Use `protect` middleware for authenticated routes
- Validate inputs before calling services

**Services:**
- Use `db.query(text, params)` with parameterized statements
- Use transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) for multi-step operations
- Handle edge cases (not found, unauthorized, duplicates)
- Return structured data objects

**Routes:**
- Use `Express Router`
- Apply `protect` middleware to authenticated endpoints
- Keep routes simple, delegate logic to controllers

**Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Database Schema Reference

Located at: `/home/yatnam/Desktop/Thomas/koottam/server/database/init.sql`

**Key Tables:**
- `users` - User accounts with counters (followers_count, following_count, posts_count)
- `posts` - Posts with counters (like_count, comment_count, share_count, view_count)
- `comments` - Comments with parent_id for nested replies
- `likes` - Likes with UNIQUE(user_id, post_id, comment_id) and CHECK constraint
- `follows` - Follow relationships with UNIQUE(follower_id, following_id)
- `bookmarks` - Bookmarks with UNIQUE(user_id, post_id)
- `shares` - Shares without uniqueness (users can share multiple times)
- `notifications` - Notifications with type/entity_type CHECK constraints
- `stories` - Stories with expires_at timestamp
- `post_views` - View tracking records
- `hashtags` - Hashtags with post_count
- `post_hashtags` - Many-to-many junction table

### Testing

**Current test command:** `npm test` (runs Jest)

**Test file example:** `/home/yatnam/Desktop/Thomas/koottam/server/src/test/app.test.js`

**Manual testing:**
- Start database: `npm run db:up`
- Start dev server: `npm run dev`
- Use curl or Postman to test endpoints
- Auth token required for protected endpoints: `Authorization: Bearer <token>`

### Common Edge Cases to Handle

1. **Duplicate operations** - Like same post twice, follow same user twice
2. **Self-operations** - User trying to follow themselves
3. **Not found** - Post/comment/user doesn't exist
4. **Unauthorized** - User trying to delete someone else's content
5. **Invalid input** - Missing required fields, invalid UUIDs
6. **Database constraints** - UNIQUE violations, foreign key violations

### Verification Commands

After each feature:
- `npm test` - Run all tests
- Manual API testing with authentication
- Database query verification for counters and constraints

---

## Notes

- All UUIDs are generated by PostgreSQL (`gen_random_uuid()`)
- Timestamps use PostgreSQL `CURRENT_TIMESTAMP`
- Counter updates use `GREATEST(count - 1, 0)` to prevent negative values
- Transactions ensure data consistency for multi-step operations
- Existing code in `src/controllers/postController.js` and `src/services/postService.js` demonstrates patterns to follow
