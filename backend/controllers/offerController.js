import Offer from "../models/offer.js";
import User from "../models/User.js";
import { createNotificationForPost } from "./notificationController.js";

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("user", "name university avatar email skills profilePicture")
      .sort({ createdAt: -1 });
    res.json({ 
      message: "Offers retrieved successfully", 
      offers, 
      count: offers.length 
    });
  } catch (error) {
    console.error("GET /api/offers error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("user", "name university avatar email skills profilePicture");
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    res.json({ message: "Offer retrieved successfully", offer });
  } catch (error) {
    console.error("GET /api/offers/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getOffersByUser = async (req, res) => {
  try {
    const offers = await Offer.find({ user: req.params.userId })
      .populate("user", "name university avatar profilePicture")
      .sort({ createdAt: -1 });
    res.json({ 
      message: "User offers retrieved successfully", 
      offers, 
      count: offers.length 
    });
  } catch (error) {
    console.error("GET /api/offers/user/:userId error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const createOffer = async (req, res) => {
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
      maxStudents,
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

    const newOffer = new Offer({
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
      maxStudents,
      price: isPaid ? price : 0,
      isPaid,
      tags,
      user: user._id
    });

    await newOffer.save();
    const populated = await Offer.findById(newOffer._id)
      .populate("user", "name university avatar email skills profilePicture");
    
    // Create notifications for all other users
    await createNotificationForPost('offer', populated, userId);
    
    res.status(201).json({ 
      message: "Offer created successfully", 
      offer: populated 
    });
  } catch (error) {
    console.error("POST /api/offers error:", error);
    res.status(400).json({ error: "Failed to create offer", message: error.message });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const updates = req.body;
    const offer = await Offer.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    ).populate("user", "name university avatar email skills profilePicture");
    
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    
    res.json({ message: "Offer updated successfully", offer });
  } catch (error) {
    console.error("PUT /api/offers/:id error:", error);
    res.status(400).json({ error: "Failed to update offer", message: error.message });
  }
};

export const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be 'pending' or 'completed'" 
      });
    }
    
    const offer = await Offer.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate("user", "name university avatar email skills profilePicture");
    
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    
    res.json({ message: "Offer status updated successfully", offer });
  } catch (error) {
    console.error("PUT /api/offers/:id/status error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/offers/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};