import express from "express";
import { 
  getUserNotifications, 
  getUnreadCount, 
  createNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "../controllers/notificationController.js";
import { validateObjectId } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// POST /api/notifications - create notification
router.post("/", asyncHandler(createNotification));

// GET /api/notifications/user/:userId/unread - get unread notifications count - MUST BE BEFORE other user routes
router.get("/user/:userId/unread", validateObjectId, asyncHandler(getUnreadCount));

// PUT /api/notifications/user/:userId/mark-all-read - mark all notifications as read - MUST BE BEFORE /:id routes
router.put("/user/:userId/mark-all-read", validateObjectId, asyncHandler(markAllAsRead));

// GET /api/notifications/user/:userId - get user notifications
router.get("/user/:userId", validateObjectId, asyncHandler(getUserNotifications));

// PUT /api/notifications/:id/read - mark notification as read
router.put("/:id/read", validateObjectId, asyncHandler(markAsRead));

// DELETE /api/notifications/:id - delete notification
router.delete("/:id", validateObjectId, asyncHandler(deleteNotification));

// Export the helper function for creating notifications
export { createNotificationForPost } from "../controllers/notificationController.js";

export default router;