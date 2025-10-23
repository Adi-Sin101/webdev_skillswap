import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, university, bio, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      university: university || "",
      bio: bio || "",
      skills: skills || [],
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      // Initialize default values
      badges: ["New User"],
      rating: 0,
      completedActivities: 0
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.email);

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        error: "Account Banned",
        message: `Your account has been banned. Reason: ${user.bannedReason || 'Violation of platform policies'}`,
        bannedAt: user.bannedAt,
        isBanned: true
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    res.json({ user: req.user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};