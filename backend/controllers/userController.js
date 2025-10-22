import User from "../models/User.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Get current user to check for existing profile picture
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old profile picture from Cloudinary if exists
    if (currentUser.profilePicture && currentUser.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(currentUser.cloudinaryPublicId);
      } catch (deleteError) {
        console.warn('Failed to delete old profile picture:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(dataURI, 'skillswap/profiles');
    
    // Update user with new profile picture URL and public_id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: uploadResult.url,
        cloudinaryPublicId: uploadResult.public_id
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
      profilePicture: uploadResult.url
    });

  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ 
      error: "Failed to upload profile picture", 
      message: error.message 
    });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete from Cloudinary if exists
    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId);
      } catch (deleteError) {
        console.warn('Failed to delete from Cloudinary:', deleteError);
        // Continue with database update even if Cloudinary delete fails
      }
    }

    // Update user to remove profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          profilePicture: 1,
          cloudinaryPublicId: 1
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile picture deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Delete profile picture error:", error);
    res.status(500).json({ 
      error: "Failed to delete profile picture", 
      message: error.message 
    });
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