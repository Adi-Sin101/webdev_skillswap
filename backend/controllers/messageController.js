import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Response from '../models/Response.js';

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name avatar email')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    // Add unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          receiver: userId,
          isRead: false
        });

        return {
          ...conversation.toObject(),
          unreadCount,
          otherParticipant: conversation.participants.find(p => p._id.toString() !== userId)
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
};

// Create or get conversation for an application
const createOrGetConversation = async (req, res) => {
  try {
    const { applicationId, ownerId } = req.body;
    
    console.log('Creating/getting conversation for:', { applicationId, ownerId });

    // Get the application details
    const application = await Response.findById(applicationId)
      .populate('offerID')
      .populate('requestID')
      .populate('applicant');

    console.log('Found application:', application ? 'yes' : 'no');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Determine the item details
    const item = application.offerID || application.requestID;
    const itemType = application.offerID ? 'offer' : 'request';
    
    console.log('Item found:', item ? 'yes' : 'no', 'itemType:', itemType);
    console.log('Item details:', item ? { id: item._id, title: item.title } : 'none');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Associated item not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ applicationId })
      .populate('participants', 'name avatar email');

    console.log('Existing conversation found:', conversation ? 'yes' : 'no');

    if (!conversation) {
      // Create new conversation
      const participants = [ownerId, application.applicant._id];
      
      console.log('Creating conversation with participants:', participants);
      console.log('Application ID:', applicationId, 'itemType:', itemType, 'itemId:', item._id, 'itemTitle:', item.title);
      
      conversation = await Conversation.create({
        participants,
        applicationId,
        itemType,
        itemId: item._id,
        itemTitle: item.title
      });

      console.log('Conversation created:', conversation._id);

      // Populate the participants
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar email');
    }

    res.json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        otherParticipant: conversation.participants.find(p => p._id.toString() !== ownerId)
      }
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create or get conversation'
    });
  }
};

// Get messages for a conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read for the requesting user
    const userId = req.query.userId;
    if (userId) {
      await Message.updateMany(
        {
          conversationId,
          receiver: userId,
          isRead: false
        },
        {
          isRead: true,
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      conversation
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        error: 'User not authorized to send messages in this conversation'
      });
    }

    // Get the receiver (the other participant)
    const receiverId = conversation.participants.find(
      id => id.toString() !== senderId
    );

    // Create the message
    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date()
    });

    // Populate the message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Get unread message count for a user
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

export {
  getUserConversations,
  createOrGetConversation,
  getConversationMessages,
  sendMessage,
  getUnreadCount
};