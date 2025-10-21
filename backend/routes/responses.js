import express from 'express';
import { 
  applyToOffer, 
  applyToRequest, 
  getOfferResponses, 
  getRequestResponses, 
  getOfferResponseCounts, 
  getRequestResponseCounts, 
  updateResponseStatus,
  markEmailExchanged,
  markSwapComplete,
  getUserAcceptedResponses
} from '../controllers/responseController.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get response counts for multiple offers - MUST BE BEFORE /offers/:id routes
router.post('/offers/response-counts', asyncHandler(getOfferResponseCounts));

// Get response counts for multiple requests - MUST BE BEFORE /requests/:id routes
router.post('/requests/response-counts', asyncHandler(getRequestResponseCounts));

// Apply to an offer
router.post('/offers/:id/apply', validateObjectId, asyncHandler(applyToOffer));

// Apply to help with a request
router.post('/requests/:id/apply', validateObjectId, asyncHandler(applyToRequest));

// Get responses for an offer
router.get('/offers/:id/responses', validateObjectId, asyncHandler(getOfferResponses));

// Get responses for a request
router.get('/requests/:id/responses', validateObjectId, asyncHandler(getRequestResponses));

// Update response status (accept/reject)
router.put('/:id/status', validateObjectId, asyncHandler(updateResponseStatus));

// Mark email as exchanged
router.put('/:id/email-exchanged', validateObjectId, asyncHandler(markEmailExchanged));

// Mark swap as complete
router.put('/:id/complete', validateObjectId, asyncHandler(markSwapComplete));

// Undo swap completion
router.put('/:id/undo-complete', validateObjectId, asyncHandler(async (req, res) => {
  // Dynamic import to avoid circular issues
  const { undoSwapComplete } = await import('../controllers/responseController.js');
  return undoSwapComplete(req, res);
}));

// Get user's accepted responses (for dashboard)
router.get('/user/:userId/accepted', validateObjectId, asyncHandler(getUserAcceptedResponses));

export default router;