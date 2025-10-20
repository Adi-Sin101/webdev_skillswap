import express from "express";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/notifications/user/:userId - get user notifications
router.get("/user/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .populate("sender", "name avatar")
      .populate("relatedOffer", "title category")
      .populate("relatedRequest", "title category")
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications

    res.json({ 
      message: "Notifications retrieved successfully", 
      notifications, 
      count: notifications.length 
    });
  } catch (err) {
    console.error("GET /api/notifications/user/:userId error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// GET /api/notifications/user/:userId/unread - get unread notifications count
router.get("/user/:userId/unread", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.params.userId, 
      isRead: false 
    });

    res.json({ 
      message: "Unread count retrieved successfully", 
      unreadCount: count 
    });
  } catch (err) {
    console.error("GET /api/notifications/user/:userId/unread error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// POST /api/notifications - create notification
router.post("/", async (req, res) => {
  try {
    const { recipient, sender, type, title, message, relatedOffer, relatedRequest, actionUrl } = req.body;
    
    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ error: "recipient, type, title, and message are required" });
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
      .populate("sender", "name avatar")
      .populate("relatedOffer", "title category")
      .populate("relatedRequest", "title category");

    res.status(201).json({ 
      message: "Notification created successfully", 
      notification: populatedNotification 
    });
  } catch (err) {
    console.error("POST /api/notifications error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// PUT /api/notifications/:id/read - mark notification as read
router.put("/:id/read", async (req, res) => {
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
  } catch (err) {
    console.error("PUT /api/notifications/:id/read error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// PUT /api/notifications/user/:userId/mark-all-read - mark all notifications as read
router.put("/user/:userId/mark-all-read", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.params.userId, isRead: false },
      { isRead: true }
    );

    res.json({ 
      message: "All notifications marked as read", 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("PUT /api/notifications/user/:userId/mark-all-read error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// DELETE /api/notifications/:id - delete notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/notifications/:id error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

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

export default router;