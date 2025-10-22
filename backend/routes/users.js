import express from "express";
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserByEmail,
  uploadProfilePicture,
  deleteProfilePicture,
  upload
} from "../controllers/userController.js";
import { validateUserCreation, validateObjectId } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/users - list all users
router.get("/", asyncHandler(getAllUsers));

// GET /api/users/email/:email - get user by email (for profile lookups) - MUST BE BEFORE /:id
router.get("/email/:email", asyncHandler(getUserByEmail));

// GET /api/users/:id - get user by ID
router.get("/:id", validateObjectId, asyncHandler(getUserById));

// POST /api/users - create user
router.post("/", validateUserCreation, asyncHandler(createUser));

// PUT /api/users/:id - update user
router.put("/:id", validateObjectId, asyncHandler(updateUser));

// POST /api/users/:id/profile-picture - upload profile picture
router.post("/:id/profile-picture", validateObjectId, upload.single('profilePicture'), asyncHandler(uploadProfilePicture));

// DELETE /api/users/:id/profile-picture - delete profile picture
router.delete("/:id/profile-picture", validateObjectId, asyncHandler(deleteProfilePicture));

// DELETE /api/users/:id - delete user
router.delete("/:id", validateObjectId, asyncHandler(deleteUser));

export default router;