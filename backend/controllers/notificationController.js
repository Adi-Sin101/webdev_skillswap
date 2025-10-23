import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .populate("sender", "name avatar profilePicture")
      .populate("relatedOffer", "title category")
      .populate("relatedRequest", "title category")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications

    res.json({ 
      message: "Notifications retrieved successfully", 
      notifications, 
      count: notifications.length 
    });
  } catch (error) {
    console.error("GET /api/notifications/user/:userId error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.params.userId, 
      isRead: false 
    });

    res.json({ 
      message: "Unread count retrieved successfully", 
      unreadCount: count 
    });
  } catch (error) {
    console.error("GET /api/notifications/user/:userId/unread error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { recipient, sender, type, title, message, relatedOffer, relatedRequest, actionUrl } = req.body;
    
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ 
        error: "recipient, type, title, and message are required" 
      });
    }

    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedOffer,
      relatedRequest,
      actionUrl
    });

    await notification.save();
    
    // Populate for response
    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "name avatar profilePicture")
      .populate("relatedOffer", "title category")
      .populate("relatedRequest", "title category");

    res.status(201).json({ 
      message: "Notification created successfully", 
      notification: populatedNotification 
    });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, 
      { isRead: true }, 
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ 
      message: "Notification marked as read", 
      notification 
    });
  } catch (error) {
    console.error("PUT /api/notifications/:id/read error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.params.userId, isRead: false },
      { isRead: true }
    );

    res.json({ 
      message: "All notifications marked as read", 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("PUT /api/notifications/user/:userId/mark-all-read error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/notifications/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Helper function to create notifications for new offers/requests
export const createNotificationForPost = async (postType, post, excludeUserId) => {
  try {
    // Get all users except the one who created the post
    const users = await User.find({ _id: { $ne: excludeUserId } }).select('_id');
    
    const notificationData = {
      sender: post.user,
      type: postType === 'offer' ? 'new_offer' : 'new_request',
      title: postType === 'offer' ? 'New Skill Offer Available' : 'New Skill Request Posted',
      message: `${postType === 'offer' ? 'Someone is offering' : 'Someone needs help with'}: ${post.title}`,
      actionUrl: '/',
      ...(postType === 'offer' ? { relatedOffer: post._id } : { relatedRequest: post._id })
    };

    // Create notifications for all users
    const notifications = users.map(user => ({
      ...notificationData,
      recipient: user._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} notifications for new ${postType}`);
    }
  } catch (error) {
    console.error(`Error creating notifications for new ${postType}:`, error);
  }
};