import express from "express";
import Offer from "../models/offer.js";
import User from "../models/User.js";
import { createNotificationForPost } from "./notifications.js";

const router = express.Router();

// GET /api/offers - list all offers
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("user", "name university avatar email skills")
      .sort({ createdAt: -1 });
    res.json({ message: "Offers retrieved successfully", offers, count: offers.length });
  } catch (err) {
    console.error("GET /api/offers error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// GET /api/offers/:id - get single offer
router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("user", "name university avatar email skills");
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer retrieved successfully", offer });
  } catch (err) {
    console.error("GET /api/offers/:id error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// GET /api/offers/user/:userId - get offers by specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const offers = await Offer.find({ user: req.params.userId })
      .populate("user", "name university avatar")
      .sort({ createdAt: -1 });
    res.json({ 
      message: "User offers retrieved successfully", 
      offers, 
      count: offers.length 
    });
  } catch (err) {
    console.error("GET /api/offers/user/:userId error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// POST /api/offers - create
router.post("/", async (req, res) => {
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
    
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

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
    const populated = await Offer.findById(newOffer._id).populate("user", "name university avatar email skills");
    
    // Create notifications for all other users
    await createNotificationForPost('offer', populated, userId);
    
    res.status(201).json({ message: "Offer created successfully", offer: populated });
  } catch (err) {
    console.error("POST /api/offers error:", err);
    res.status(400).json({ error: "Failed to create offer", message: err.message });
  }
});

// PUT /api/offers/:id - update
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const offer = await Offer.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(
      "user",
      "name university avatar email skills"
    );
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer updated successfully", offer });
  } catch (err) {
    console.error("PUT /api/offers/:id error:", err);
    res.status(400).json({ error: "Failed to update offer", message: err.message });
  }
});

// PUT /api/offers/:id/status - update offer status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'pending' or 'completed'" });
    }
    
    const offer = await Offer.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate("user", "name university avatar email skills");
    
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer status updated successfully", offer });
  } catch (err) {
    console.error("PUT /api/offers/:id/status error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// DELETE /api/offers/:id - delete
router.delete("/:id", async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/offers/:id error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

export default router;