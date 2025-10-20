import express from "express";
import { 
  getAllOffers, 
  getOfferById, 
  getOffersByUser, 
  createOffer, 
  updateOffer, 
  updateOfferStatus, 
  deleteOffer 
} from "../controllers/offerController.js";
import { validateObjectId } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/offers - list all offers
router.get("/", asyncHandler(getAllOffers));

// GET /api/offers/user/:userId - get offers by specific user - MUST BE BEFORE /:id
router.get("/user/:userId", validateObjectId, asyncHandler(getOffersByUser));

// GET /api/offers/:id - get single offer
router.get("/:id", validateObjectId, asyncHandler(getOfferById));

// POST /api/offers - create
router.post("/", asyncHandler(createOffer));

// PUT /api/offers/:id - update
router.put("/:id", validateObjectId, asyncHandler(updateOffer));

// PUT /api/offers/:id/status - update offer status
router.put("/:id/status", validateObjectId, asyncHandler(updateOfferStatus));

// DELETE /api/offers/:id - delete
router.delete("/:id", validateObjectId, asyncHandler(deleteOffer));

export default router;