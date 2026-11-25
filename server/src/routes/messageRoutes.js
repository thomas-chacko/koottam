import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getConversationsController,
  createConversationController,
  getConversationController,
  deleteConversationController,
  sendMessageController,
  getMessagesController,
  updateMessageController,
  deleteMessageController,
  markMessageAsReadController,
  addMemberController,
  removeMemberController,
} from "../controllers/messageController.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.get("/conversations", getConversationsController);
router.post("/conversation", createConversationController);
router.get("/conversation/:id", getConversationController);
router.delete("/conversation/:id", deleteConversationController);

// Message routes
router.post("/", sendMessageController);
router.get("/conversation/:id/messages", getMessagesController);
router.put("/:id", updateMessageController);
router.delete("/:id", deleteMessageController);
router.put("/:id/read", markMessageAsReadController);

// Conversation member routes
router.post("/conversation/:id/members", addMemberController);
router.delete("/conversation/:id/members/:userId", removeMemberController);

export default router;

