import Request from "../models/Request.js";
import User from "../models/User.js";
import { createNotificationForPost } from "./notificationController.js";

export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("user", "name university avatar email skills")
      .sort({ createdAt: -1 });
    res.json({ 
      message: "Requests retrieved successfully", 
      requests, 
      count: requests.length 
    });
  } catch (error) {
    console.error("GET /api/requests error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("user", "name university avatar email skills");
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request retrieved successfully", request });
  } catch (error) {
    console.error("GET /api/requests/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getRequestsByUser = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.params.userId })
      .populate("user", "name university avatar")
      .sort({ createdAt: -1 });
    res.json({ 
      message: "User requests retrieved successfully", 
      requests, 
      count: requests.length 
    });
  } catch (error) {
    console.error("GET /api/requests/user/:userId error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category,
      skillLevel,
      prerequisites,
      whatYouWillLearn,
      sessionType,
      sessionDuration,
      totalDuration,
      deliveryMethod,
      location,
      availability,
      preferredSchedule,
      price,
      isPaid,
      tags,
      userId
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const newRequest = new Request({
      title,
      description,
      category,
      skillLevel,
      prerequisites,
      whatYouWillLearn,
      sessionType,
      sessionDuration,
      totalDuration,
      deliveryMethod,
      location,
      availability,
      preferredSchedule,
      price: isPaid ? price : 0,
      isPaid,
      tags,
      user: user._id
    });

    await newRequest.save();
    const populated = await Request.findById(newRequest._id)
      .populate("user", "name university avatar email skills");
    
    // Create notifications for all other users
    await createNotificationForPost('request', populated, userId);
    
    res.status(201).json({ 
      message: "Request created successfully", 
      request: populated 
    });
  } catch (error) {
    console.error("POST /api/requests error:", error);
    res.status(400).json({ error: "Failed to create request", message: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const updates = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    ).populate("user", "name university avatar email skills");
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json({ message: "Request updated successfully", request });
  } catch (error) {
    console.error("PUT /api/requests/:id error:", error);
    res.status(400).json({ error: "Failed to update request", message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be 'pending' or 'completed'" 
      });
    }
    
    const request = await Request.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate("user", "name university avatar email skills");
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json({ message: "Request status updated successfully", request });
  } catch (error) {
    console.error("PUT /api/requests/:id/status error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/requests/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};