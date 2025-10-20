import express from "express";
import { 
  getAllRequests, 
  getRequestById, 
  getRequestsByUser, 
  createRequest, 
  updateRequest, 
  updateRequestStatus, 
  deleteRequest 
} from "../controllers/requestController.js";
import { validateObjectId } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/requests - list all requests
router.get("/", asyncHandler(getAllRequests));

// GET /api/requests/user/:userId - get requests by specific user - MUST BE BEFORE /:id
router.get("/user/:userId", validateObjectId, asyncHandler(getRequestsByUser));

// GET /api/requests/:id - get single request
router.get("/:id", validateObjectId, asyncHandler(getRequestById));

// POST /api/requests - create
router.post("/", asyncHandler(createRequest));

// PUT /api/requests/:id - update
router.put("/:id", validateObjectId, asyncHandler(updateRequest));

// PUT /api/requests/:id/status - update request status
router.put("/:id/status", validateObjectId, asyncHandler(updateRequestStatus));

// DELETE /api/requests/:id - delete
router.delete("/:id", validateObjectId, asyncHandler(deleteRequest));

export default router;