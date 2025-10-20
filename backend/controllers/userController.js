import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.json({ 
      message: "Users retrieved successfully", 
      users, 
      count: users.length 
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    console.error("GET /api/users/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, university, bio, skills, avatar } = req.body;

    const newUser = new User({ 
      name, 
      email, 
      university, 
      bio, 
      skills, 
      avatar 
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      message: "User created successfully", 
      user: newUser 
    });
  } catch (error) {
    console.error("POST /api/users error:", error);
    res.status(400).json({ error: "Failed to create user", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("PUT /api/users/:id error:", error);
    res.status(400).json({ error: "Failed to update user", message: error.message });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    console.error("GET /api/users/email/:email error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};