import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";
import {
  getUserConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  addMember,
  removeMember,
} from "../services/messageService.js";

// @desc    Get user's conversations
// @route   GET /api/v1/message/conversations
// @access  Private
export const getConversationsController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const data = await getUserConversations({
    userId: req.user.id,
    limit,
    offset,
  });

  return successResponse(res, 200, "Conversations retrieved successfully", data);
});

// @desc    Create new conversation
// @route   POST /api/v1/message/conversation
// @access  Private
export const createConversationController = asyncHandler(async (req, res) => {
  const { type, name, memberIds } = req.body;

  if (!type) {
    throw new AppError("Conversation type is required", 400);
  }

  const data = await createConversation({
    userId: req.user.id,
    type,
    name,
    memberIds,
  });

  const statusCode = data.existed ? 200 : 201;
  const message = data.existed
    ? "Conversation already exists"
    : "Conversation created successfully";

  return successResponse(res, statusCode, message, data);
});

// @desc    Get conversation details
// @route   GET /api/v1/message/conversation/:id
// @access  Private
export const getConversationController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Conversation ID is required", 400);
  }

  const data = await getConversation({
    conversationId: id,
    userId: req.user.id,
  });

  return successResponse(res, 200, "Conversation retrieved successfully", data);
});

// @desc    Delete conversation
// @route   DELETE /api/v1/message/conversation/:id
// @access  Private
export const deleteConversationController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Conversation ID is required", 400);
  }

  const data = await deleteConversation({
    conversationId: id,
    userId: req.user.id,
  });

  return successResponse(res, 200, "Conversation deleted successfully", data);
});

// @desc    Send message
// @route   POST /api/v1/message
// @access  Private
export const sendMessageController = asyncHandler(async (req, res) => {
  const { conversationId, content, mediaUrl } = req.body;

  if (!conversationId) {
    throw new AppError("Conversation ID is required", 400);
  }

  const data = await sendMessage({
    userId: req.user.id,
    conversationId,
    content,
    mediaUrl,
  });

  return successResponse(res, 201, "Message sent successfully", data);
});

// @desc    Get messages from conversation
// @route   GET /api/v1/message/conversation/:id/messages
// @access  Private
export const getMessagesController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  if (!id) {
    throw new AppError("Conversation ID is required", 400);
  }

  const data = await getMessages({
    conversationId: id,
    userId: req.user.id,
    limit,
    offset,
  });

  return successResponse(res, 200, "Messages retrieved successfully", data);
});

// @desc    Update message
// @route   PUT /api/v1/message/:id
// @access  Private
export const updateMessageController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  const data = await updateMessage({
    messageId: id,
    userId: req.user.id,
    content,
  });

  return successResponse(res, 200, "Message updated successfully", data);
});

// @desc    Delete message
// @route   DELETE /api/v1/message/:id
// @access  Private
export const deleteMessageController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  const data = await deleteMessage({
    messageId: id,
    userId: req.user.id,
  });

  return successResponse(res, 200, "Message deleted successfully", data);
});

// @desc    Mark message as read
// @route   PUT /api/v1/message/:id/read
// @access  Private
export const markMessageAsReadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  const data = await markMessageAsRead({
    messageId: id,
    userId: req.user.id,
  });

  return successResponse(res, 200, "Message marked as read", data);
});

// @desc    Add member to group conversation
// @route   POST /api/v1/message/conversation/:id/members
// @access  Private
export const addMemberController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId: newMemberId } = req.body;

  if (!id) {
    throw new AppError("Conversation ID is required", 400);
  }

  if (!newMemberId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await addMember({
    conversationId: id,
    userId: req.user.id,
    newMemberId,
  });

  return successResponse(res, 200, "Member added successfully", data);
});

// @desc    Remove member from group conversation
// @route   DELETE /api/v1/message/conversation/:id/members/:userId
// @access  Private
export const removeMemberController = asyncHandler(async (req, res) => {
  const { id, userId: memberIdToRemove } = req.params;

  if (!id) {
    throw new AppError("Conversation ID is required", 400);
  }

  if (!memberIdToRemove) {
    throw new AppError("User ID is required", 400);
  }

  const data = await removeMember({
    conversationId: id,
    userId: req.user.id,
    memberIdToRemove,
  });

  return successResponse(res, 200, "Member removed successfully", data);
});

