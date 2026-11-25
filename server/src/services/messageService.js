import db from "../config/db.js";
import AppError from "../utils/AppError.js";
import { emitToConversation, emitToUser } from "../config/socket.js";

/**
 * Get user's conversations with latest message
 */
export const getUserConversations = async ({ userId, limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT 
       c.id, c.name, c.type, c.created_at,
       (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) as member_count,
       m.content as last_message,
       m.created_at as last_message_at,
       u.username as last_sender_username,
       u.full_name as last_sender_name,
       u.avatar_url as last_sender_avatar,
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count
     FROM conversations c
     INNER JOIN conversation_members cm ON cm.conversation_id = c.id
     LEFT JOIN LATERAL (
       SELECT content, created_at, sender_id 
       FROM messages 
       WHERE conversation_id = c.id 
       ORDER BY created_at DESC 
       LIMIT 1
     ) m ON true
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE cm.user_id = $1
     ORDER BY COALESCE(m.created_at, c.created_at) DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return { conversations: result.rows };
};

/**
 * Create a new conversation
 */
export const createConversation = async ({ userId, type, name, memberIds }) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Validate type
    if (!["direct", "group"].includes(type)) {
      throw new AppError("Invalid conversation type. Must be 'direct' or 'group'", 400);
    }

    // For direct conversations, check if one already exists
    if (type === "direct") {
      if (!memberIds || memberIds.length !== 1) {
        throw new AppError("Direct conversations require exactly one other member", 400);
      }

      const otherUserId = memberIds[0];

      // Check if direct conversation already exists
      const existingConv = await client.query(
        `SELECT c.id 
         FROM conversations c
         INNER JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = $1
         INNER JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = $2
         WHERE c.type = 'direct'
         AND (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) = 2`,
        [userId, otherUserId]
      );

      if (existingConv.rows[0]) {
        await client.query("ROLLBACK");
        return { conversation: existingConv.rows[0], existed: true };
      }
    }

    // Create conversation
    const conversationResult = await client.query(
      `INSERT INTO conversations (name, type, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, type, created_at`,
      [name, type, userId]
    );

    const conversation = conversationResult.rows[0];

    // Add creator as admin member
    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [conversation.id, userId]
    );

    // Add other members
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        // Check if user exists
        const userCheck = await client.query(
          `SELECT id FROM users WHERE id = $1`,
          [memberId]
        );

        if (!userCheck.rows[0]) {
          throw new AppError(`User with ID ${memberId} not found`, 404);
        }

        await client.query(
          `INSERT INTO conversation_members (conversation_id, user_id, role)
           VALUES ($1, $2, 'member')`,
          [conversation.id, memberId]
        );

        // Emit real-time event to new member
        emitToUser(memberId, "conversation:new", { conversation });
      }
    }

    await client.query("COMMIT");

    return { conversation, existed: false };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get conversation details
 */
export const getConversation = async ({ conversationId, userId }) => {
  // Check if user is a member
  const memberCheck = await db.query(
    `SELECT role FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  // Get conversation details
  const conversationResult = await db.query(
    `SELECT id, name, type, created_by, created_at
     FROM conversations WHERE id = $1`,
    [conversationId]
  );

  if (!conversationResult.rows[0]) {
    throw new AppError("Conversation not found", 404);
  }

  // Get members
  const membersResult = await db.query(
    `SELECT 
       u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
       cm.role, cm.joined_at
     FROM conversation_members cm
     INNER JOIN users u ON u.id = cm.user_id
     WHERE cm.conversation_id = $1
     ORDER BY cm.joined_at ASC`,
    [conversationId]
  );

  return {
    conversation: conversationResult.rows[0],
    members: membersResult.rows,
    userRole: memberCheck.rows[0].role,
  };
};

/**
 * Delete conversation (admin only)
 */
export const deleteConversation = async ({ conversationId, userId }) => {
  // Check if user is admin of the conversation
  const memberCheck = await db.query(
    `SELECT role FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  if (memberCheck.rows[0].role !== "admin") {
    throw new AppError("Only conversation admins can delete conversations", 403);
  }

  // Delete conversation (cascade will handle members and messages)
  await db.query(`DELETE FROM conversations WHERE id = $1`, [conversationId]);

  return { message: "Conversation deleted successfully" };
};

/**
 * Send a message
 */
export const sendMessage = async ({ userId, conversationId, content, mediaUrl }) => {
  // Check if user is a member
  const memberCheck = await db.query(
    `SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  // Validate content or media
  if (!content && !mediaUrl) {
    throw new AppError("Message must have content or media", 400);
  }

  // Insert message
  const messageResult = await db.query(
    `INSERT INTO messages (conversation_id, sender_id, content, media_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, conversation_id, sender_id, content, media_url, is_read, created_at`,
    [conversationId, userId, content, mediaUrl]
  );

  const message = messageResult.rows[0];

  // Get sender info
  const senderResult = await db.query(
    `SELECT username, full_name, avatar_url FROM users WHERE id = $1`,
    [userId]
  );

  const messageWithSender = {
    ...message,
    sender: senderResult.rows[0],
  };

  // Emit real-time message to conversation
  emitToConversation(conversationId, "message:new", messageWithSender);

  return { message: messageWithSender };
};

/**
 * Get messages from a conversation (paginated)
 */
export const getMessages = async ({ conversationId, userId, limit = 50, offset = 0 }) => {
  // Check if user is a member
  const memberCheck = await db.query(
    `SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  const result = await db.query(
    `SELECT 
       m.id, m.content, m.media_url, m.is_read, m.created_at,
       u.id as sender_id, u.username, u.full_name, u.avatar_url
     FROM messages m
     INNER JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );

  return { messages: result.rows };
};

/**
 * Update a message
 */
export const updateMessage = async ({ messageId, userId, content }) => {
  // Check if message exists and user is the sender
  const messageCheck = await db.query(
    `SELECT id, conversation_id FROM messages WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );

  if (!messageCheck.rows[0]) {
    throw new AppError("Message not found or you are not the sender", 404);
  }

  if (!content) {
    throw new AppError("Content is required", 400);
  }

  // Update message
  const result = await db.query(
    `UPDATE messages 
     SET content = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, conversation_id, sender_id, content, media_url, is_read, created_at, updated_at`,
    [content, messageId]
  );

  const message = result.rows[0];

  // Emit real-time update
  emitToConversation(message.conversation_id, "message:updated", message);

  return { message };
};

/**
 * Delete a message
 */
export const deleteMessage = async ({ messageId, userId }) => {
  // Check if message exists and user is the sender
  const messageCheck = await db.query(
    `SELECT id, conversation_id FROM messages WHERE id = $1 AND sender_id = $2`,
    [messageId, userId]
  );

  if (!messageCheck.rows[0]) {
    throw new AppError("Message not found or you are not the sender", 404);
  }

  const conversationId = messageCheck.rows[0].conversation_id;

  // Delete message
  await db.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

  // Emit real-time deletion
  emitToConversation(conversationId, "message:deleted", { messageId });

  return { message: "Message deleted successfully" };
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async ({ messageId, userId }) => {
  // Check if message exists and user is in the conversation
  const messageCheck = await db.query(
    `SELECT m.id, m.conversation_id, m.sender_id
     FROM messages m
     INNER JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
     WHERE m.id = $1 AND cm.user_id = $2`,
    [messageId, userId]
  );

  if (!messageCheck.rows[0]) {
    throw new AppError("Message not found or you are not in this conversation", 404);
  }

  // Don't mark own messages as read
  if (messageCheck.rows[0].sender_id === userId) {
    return { message: "Cannot mark your own message as read" };
  }

  // Update message
  await db.query(
    `UPDATE messages SET is_read = true WHERE id = $1`,
    [messageId]
  );

  return { message: "Message marked as read" };
};

/**
 * Add member to group conversation
 */
export const addMember = async ({ conversationId, userId, newMemberId }) => {
  // Check if user is admin of the conversation
  const memberCheck = await db.query(
    `SELECT role FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  if (memberCheck.rows[0].role !== "admin") {
    throw new AppError("Only admins can add members", 403);
  }

  // Check if conversation is a group
  const conversationCheck = await db.query(
    `SELECT type FROM conversations WHERE id = $1`,
    [conversationId]
  );

  if (!conversationCheck.rows[0]) {
    throw new AppError("Conversation not found", 404);
  }

  if (conversationCheck.rows[0].type !== "group") {
    throw new AppError("Can only add members to group conversations", 400);
  }

  // Check if new member exists
  const userCheck = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [newMemberId]
  );

  if (!userCheck.rows[0]) {
    throw new AppError("User not found", 404);
  }

  // Check if already a member
  const existingMember = await db.query(
    `SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, newMemberId]
  );

  if (existingMember.rows[0]) {
    throw new AppError("User is already a member", 400);
  }

  // Add member
  await db.query(
    `INSERT INTO conversation_members (conversation_id, user_id, role)
     VALUES ($1, $2, 'member')`,
    [conversationId, newMemberId]
  );

  // Emit real-time event
  emitToConversation(conversationId, "member:added", { userId: newMemberId });
  emitToUser(newMemberId, "conversation:added", { conversationId });

  return { message: "Member added successfully" };
};

/**
 * Remove member from group conversation
 */
export const removeMember = async ({ conversationId, userId, memberIdToRemove }) => {
  // Check if user is admin of the conversation
  const memberCheck = await db.query(
    `SELECT role FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (!memberCheck.rows[0]) {
    throw new AppError("You are not a member of this conversation", 403);
  }

  if (memberCheck.rows[0].role !== "admin") {
    throw new AppError("Only admins can remove members", 403);
  }

  // Check if member to remove exists in conversation
  const memberToRemoveCheck = await db.query(
    `SELECT id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, memberIdToRemove]
  );

  if (!memberToRemoveCheck.rows[0]) {
    throw new AppError("Member not found in conversation", 404);
  }

  // Cannot remove yourself using this endpoint
  if (userId === memberIdToRemove) {
    throw new AppError("Cannot remove yourself. Use leave conversation instead", 400);
  }

  // Remove member
  await db.query(
    `DELETE FROM conversation_members WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, memberIdToRemove]
  );

  // Emit real-time event
  emitToConversation(conversationId, "member:removed", { userId: memberIdToRemove });
  emitToUser(memberIdToRemove, "conversation:removed", { conversationId });

  return { message: "Member removed successfully" };
};

