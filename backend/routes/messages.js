import express from 'express';
const router = express.Router();
import {
  getUserConversations,
  createOrGetConversation,
  getConversationMessages,
  sendMessage,
  getUnreadCount
} from '../controllers/messageController.js';

// Get all conversations for a user
router.get('/conversations/:userId', getUserConversations);

// Create or get conversation for an application
router.post('/conversations', createOrGetConversation);

// Create or get conversation between two users
router.post('/conversation', createOrGetConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Send a message
router.post('/messages', sendMessage);

// Get unread message count
router.get('/unread/:userId', getUnreadCount);

export default router;