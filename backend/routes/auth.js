import express from "express";
import { register, login, getCurrentUser } from "../controllers/authController.js";
import { validateRegistration, validateLogin } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// POST /api/auth/register - User registration
router.post("/register", validateRegistration, asyncHandler(register));

// POST /api/auth/login - User login
router.post("/login", validateLogin, asyncHandler(login));

// GET /api/auth/me - Get current user (protected route)
router.get("/me", authenticateToken, asyncHandler(getCurrentUser));

export default router;