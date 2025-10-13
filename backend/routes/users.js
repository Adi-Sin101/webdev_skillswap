import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/users - list all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-__v");
    res.json({ message: "Users retrieved successfully", users, count: users.length });
  } catch (err) {
    console.error("GET /api/users error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// GET /api/users/:id - get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User retrieved successfully", user });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// POST /api/users - create user
router.post("/", async (req, res) => {
  try {
    const { name, email, university, bio, skills, avatar } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const newUser = new User({ name, email, university, bio, skills, avatar });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("POST /api/users error:", err);
    res.status(400).json({ error: "Failed to create user", message: err.message });
  }
});

// PUT /api/users/:id - update user
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(400).json({ error: "Failed to update user", message: err.message });
  }
});

// DELETE /api/users/:id - delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/:id error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

export default router;