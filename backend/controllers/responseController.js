import Response from "../models/Response.js";
import Offer from "../models/offer.js";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import fs from 'fs';

// Debug logging function
const debugLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  try {
    fs.appendFileSync('debug.log', logMessage);
  } catch (err) {
    // Ignore file write errors
  }
};

export const applyToOffer = async (req, res) => {
  debugLog('=== APPLY TO OFFER DEBUG ===');
  try {
    const { id: offerID } = req.params;
    
    debugLog(`Offer ID: ${offerID}`);
    debugLog(`Full request body: ${JSON.stringify(req.body, null, 2)}`);
    
    const { 
      applicant, 
      message, 
      contactInfo, 
      availability, 
      proposedTimeline 
    } = req.body;

    debugLog(`Extracted data: applicant=${applicant}, message=${message?.substring(0, 50)}, availability=${availability}`);

    // Validate required fields
    if (!applicant) {
      debugLog('❌ Missing applicant ID');
      return res.status(400).json({ error: 'Applicant ID is required' });
    }

    if (!message || !message.trim()) {
      debugLog('❌ Missing or empty message');
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!availability || !availability.trim()) {
      debugLog('❌ Missing or empty availability');
      return res.status(400).json({ error: 'Availability is required' });
    }

    debugLog('✅ All validations passed');

    // Check if offer exists
    const offer = await Offer.findById(offerID).populate('user', 'name');
    if (!offer) {
      debugLog('❌ Offer not found');
      return res.status(404).json({ error: 'Offer not found' });
    }

    debugLog(`✅ Offer found: ${offer.title}`);

    // Check if user already applied
    const existingResponse = await Response.findOne({ 
      applicant, 
      offerID 
    });
    
    if (existingResponse) {
      debugLog('❌ User already applied');
      return res.status(400).json({ error: 'You have already applied to this offer' });
    }

    debugLog('✅ User has not applied before');

    // Create new response
    const response = new Response({
      applicant,
      offerID,
      message: message.trim(),
      contactInfo: {
        email: contactInfo?.email || '',
        phone: contactInfo?.phone || '',
        preferredContact: contactInfo?.preferredContact || 'email'
      },
      availability: availability.trim(),
      proposedTimeline: proposedTimeline || '',
      responseType: 'offer'
    });

    debugLog('Attempting to save response...');
    await response.save();
    debugLog('✅ Response saved successfully');
    
    // Populate applicant info for response
    await response.populate('applicant', 'name email');

    // Create notification for offer owner
    try {
      await Notification.create({
        recipient: offer.user._id,
        sender: applicant,
        type: 'offer_response',
        title: 'New Application Received',
        message: `${response.applicant.name} applied to your offer: "${offer.title}"`,
        relatedOffer: offerID,
        relatedResponse: response._id,
        actionUrl: `/applications/${response._id}`
      });
      debugLog('✅ Notification created');
    } catch (notifError) {
      debugLog(`⚠️ Error creating notification: ${notifError.message}`);
      // Continue even if notification fails
    }
    
    debugLog('✅ Application completed successfully');
    res.status(201).json({ 
      message: 'Application submitted successfully!',
      response 
    });
  } catch (error) {
    debugLog(`❌ Error applying to offer: ${error.message}`);
    debugLog(`Error stack: ${error.stack}`);
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: error.message 
    });
  }
};

export const applyToRequest = async (req, res) => {
  try {
    const { id: requestID } = req.params;
    const { 
      applicant, 
      message, 
      contactInfo, 
      availability, 
      proposedTimeline 
    } = req.body;

    console.log('Received help offer:', { requestID, applicant, message, availability });

    // Validate required fields
    if (!applicant) {
      return res.status(400).json({ error: 'Applicant ID is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!availability || !availability.trim()) {
      return res.status(400).json({ error: 'Availability is required' });
    }

    // Check if request exists
    const request = await Request.findById(requestID).populate('user', 'name');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user already applied
    const existingResponse = await Response.findOne({ 
      applicant, 
      requestID 
    });
    
    if (existingResponse) {
      return res.status(400).json({ error: 'You have already offered to help with this request' });
    }

    // Create new response
    const response = new Response({
      applicant,
      requestID,
      message: message.trim(),
      contactInfo: {
        email: contactInfo?.email || '',
        phone: contactInfo?.phone || '',
        preferredContact: contactInfo?.preferredContact || 'email'
      },
      availability: availability.trim(),
      proposedTimeline: proposedTimeline || '',
      responseType: 'request'
    });

    await response.save();
    
    // Populate applicant info for response
    await response.populate('applicant', 'name email');

    // Create notification for request owner
    try {
      await Notification.create({
        recipient: request.user._id,
        sender: applicant,
        type: 'request_response',
        title: 'Someone Wants to Help!',
        message: `${response.applicant.name} offered to help with your request: "${request.title}"`,
        relatedRequest: requestID,
        relatedResponse: response._id,
        actionUrl: `/applications/${response._id}`
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue even if notification fails
    }
    
    res.status(201).json({ 
      message: 'Offer to help submitted successfully!',
      response 
    });
  } catch (error) {
    console.error('Error applying to request:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Failed to submit offer to help',
      details: error.message 
    });
  }
};

export const getOfferResponses = async (req, res) => {
  try {
    const { id: offerID } = req.params;
    const { status } = req.query;

    const query = { offerID };
    if (status) {
      query.status = status;
    }

    const responses = await Response.find(query)
      .populate('applicant', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({ responses, count: responses.length });
  } catch (error) {
    console.error('Error fetching offer responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

export const getRequestResponses = async (req, res) => {
  try {
    const { id: requestID } = req.params;
    const { status } = req.query;

    const query = { requestID };
    if (status) {
      query.status = status;
    }

    const responses = await Response.find(query)
      .populate('applicant', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({ responses, count: responses.length });
  } catch (error) {
    console.error('Error fetching request responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

export const getOfferResponseCounts = async (req, res) => {
  try {
    const { offerIDs } = req.body;
    
    const responseCounts = await Response.aggregate([
      { $match: { offerID: { $in: offerIDs.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$offerID', count: { $sum: 1 } } }
    ]);

    // Create a map for easy lookup
    const countMap = {};
    responseCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    res.json({ responseCounts: countMap });
  } catch (error) {
    console.error('Error fetching response counts:', error);
    res.status(500).json({ error: 'Failed to fetch response counts' });
  }
};

export const getRequestResponseCounts = async (req, res) => {
  try {
    const { requestIDs } = req.body;
    
    const responseCounts = await Response.aggregate([
      { $match: { requestID: { $in: requestIDs.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $group: { _id: '$requestID', count: { $sum: 1 } } }
    ]);

    // Create a map for easy lookup
    const countMap = {};
    responseCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    res.json({ responseCounts: countMap });
  } catch (error) {
    console.error('Error fetching response counts:', error);
    res.status(500).json({ error: 'Failed to fetch response counts' });
  }
};

export const updateResponseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ownerId } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const response = await Response.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('applicant', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // If accepted, update the offer/request status to completed
    if (status === 'accepted') {
      try {
        if (response.offerID) {
          await Offer.findByIdAndUpdate(response.offerID, { status: 'completed' });
          const offer = await Offer.findById(response.offerID);
          
          // Create notification for accepted applicant
          await Notification.create({
            recipient: response.applicant._id,
            sender: ownerId,
            type: 'offer_response',
            title: 'Application Accepted! 🎉',
            message: `Your application for "${offer.title}" has been accepted!`,
            relatedOffer: response.offerID,
            actionUrl: `/offers/${response.offerID}`
          });
        } else if (response.requestID) {
          await Request.findByIdAndUpdate(response.requestID, { status: 'completed' });
          const request = await Request.findById(response.requestID);
          
          // Create notification for accepted helper
          await Notification.create({
            recipient: response.applicant._id,
            sender: ownerId,
            type: 'request_response',
            title: 'Offer to Help Accepted! 🎉',
            message: `Your offer to help with "${request.title}" has been accepted!`,
            relatedRequest: response.requestID,
            actionUrl: `/requests/${response.requestID}`
          });
        }
      } catch (updateError) {
        console.error('Error updating post status:', updateError);
        // Continue even if status update fails
      }
    } else if (status === 'rejected') {
      // Create notification for rejected applicant
      try {
        if (response.offerID) {
          const offer = await Offer.findById(response.offerID);
          await Notification.create({
            recipient: response.applicant._id,
            sender: ownerId,
            type: 'offer_response',
            title: 'Application Update',
            message: `Your application for "${offer.title}" was not selected this time.`,
            relatedOffer: response.offerID,
            actionUrl: `/offers/${response.offerID}`
          });
        } else if (response.requestID) {
          const request = await Request.findById(response.requestID);
          await Notification.create({
            recipient: response.applicant._id,
            sender: ownerId,
            type: 'request_response',
            title: 'Offer to Help Update',
            message: `Your offer to help with "${request.title}" was not selected this time.`,
            relatedRequest: response.requestID,
            actionUrl: `/requests/${response.requestID}`
          });
        }
      } catch (notifError) {
        console.error('Error creating rejection notification:', notifError);
        // Continue even if notification fails
      }
    }

    res.json({ message: `Response ${status}`, response });
  } catch (error) {
    console.error('Error updating response status:', error);
    res.status(500).json({ error: 'Failed to update response status' });
  }
};

// Mark email as exchanged (after users coordinate via email)
export const markEmailExchanged = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const response = await Response.findById(id)
      .populate('offerID', 'user title')
      .populate('requestID', 'user title')
      .populate('applicant', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.status !== 'accepted') {
      return res.status(400).json({ error: 'Response must be accepted to exchange emails' });
    }

    // Verify user is involved in this response
    const ownerId = response.offerID?.user || response.requestID?.user;
    if (response.applicant._id.toString() !== userId && ownerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    response.emailExchanged = true;
    await response.save();

    res.json({ message: 'Email exchange confirmed', response });
  } catch (error) {
    console.error('Error marking email exchanged:', error);
    res.status(500).json({ error: 'Failed to mark email exchanged' });
  }
};

// Mark swap as complete by one user
export const markSwapComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const response = await Response.findById(id)
      .populate('offerID', 'user title')
      .populate('requestID', 'user title')
      .populate('applicant', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.status !== 'accepted') {
      return res.status(400).json({ error: 'Response must be accepted to mark as complete' });
    }

    if (!response.emailExchanged) {
      return res.status(400).json({ error: 'Email must be exchanged before marking as complete' });
    }

    // Determine if user is applicant or owner
    const ownerId = response.offerID?.user || response.requestID?.user;
    let userRole = '';
    
    if (response.applicant._id.toString() === userId) {
      response.isApplicantCompleted = true;
      userRole = 'applicant';
    } else if (ownerId.toString() === userId) {
      response.isOwnerCompleted = true;
      userRole = 'owner';
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // If both completed, mark swap as fully completed
    if (response.isApplicantCompleted && response.isOwnerCompleted) {
      response.isSwapCompleted = true;
      response.swapCompletedAt = new Date();
      
      // Send completion notification to both users
      try {
        const title = response.offerID?.title || response.requestID?.title;
        const completionMessage = `🎉 Skill swap for "${title}" has been completed by both participants!`;
        
        await Notification.create({
          recipient: response.applicant._id,
          type: 'session_completed',
          title: 'Skill Swap Completed!',
          message: completionMessage,
          relatedOffer: response.offerID,
          relatedRequest: response.requestID,
          actionUrl: response.offerID ? `/offers/${response.offerID._id}` : `/requests/${response.requestID._id}`
        });

        await Notification.create({
          recipient: ownerId,
          type: 'session_completed',
          title: 'Skill Swap Completed!',
          message: completionMessage,
          relatedOffer: response.offerID,
          relatedRequest: response.requestID,
          actionUrl: response.offerID ? `/offers/${response.offerID._id}` : `/requests/${response.requestID._id}`
        });
      } catch (notifError) {
        console.error('Error creating completion notifications:', notifError);
      }
    } else {
      // Send notification to the other user to complete
      try {
        const title = response.offerID?.title || response.requestID?.title;
        const otherUserId = userRole === 'applicant' ? ownerId : response.applicant._id;
        const otherUserName = userRole === 'applicant' ? 'the offer owner' : response.applicant.name;
        
        await Notification.create({
          recipient: otherUserId,
          sender: userId,
          type: 'session_completed',
          title: 'Skill Swap Completion Pending',
          message: `${userRole === 'applicant' ? response.applicant.name : 'The offer owner'} has marked the skill swap for "${title}" as complete. Please confirm completion on your end.`,
          relatedOffer: response.offerID,
          relatedRequest: response.requestID,
          actionUrl: response.offerID ? `/offers/${response.offerID._id}` : `/requests/${response.requestID._id}`
        });
      } catch (notifError) {
        console.error('Error creating pending completion notification:', notifError);
      }
    }

    await response.save();
    
    res.json({ 
      message: response.isSwapCompleted ? 'Skill swap completed by both users!' : 'Marked as complete, waiting for other user',
      response 
    });
  } catch (error) {
    console.error('Error marking swap complete:', error);
    res.status(500).json({ error: 'Failed to mark swap complete' });
  }
};

// Get user's accepted responses (for showing complete buttons)
export const getUserAcceptedResponses = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get responses where user is the applicant
    const applicantResponses = await Response.find({
      applicant: userId,
      status: 'accepted'
    })
    .populate('offerID', 'title user')
    .populate('requestID', 'title user')
    .sort({ updatedAt: -1 });

    // Get responses where user is the owner (via their offers/requests)
    const userOffers = await Offer.find({ user: userId }).select('_id');
    const userRequests = await Request.find({ user: userId }).select('_id');
    
    const ownerResponses = await Response.find({
      $or: [
        { offerID: { $in: userOffers.map(o => o._id) } },
        { requestID: { $in: userRequests.map(r => r._id) } }
      ],
      status: 'accepted'
    })
    .populate('applicant', 'name email')
    .populate('offerID', 'title')
    .populate('requestID', 'title')
    .sort({ updatedAt: -1 });

    res.json({ 
      applicantResponses,
      ownerResponses,
      total: applicantResponses.length + ownerResponses.length
    });
  } catch (error) {
    console.error('Error fetching user accepted responses:', error);
    res.status(500).json({ error: 'Failed to fetch accepted responses' });
  }
};

// Undo a previously marked completion by a user
export const undoSwapComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const response = await Response.findById(id)
      .populate('offerID', 'user title')
      .populate('requestID', 'user title')
      .populate('applicant', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const ownerId = response.offerID?.user || response.requestID?.user;

    if (response.applicant._id.toString() === userId) {
      response.isApplicantCompleted = false;
    } else if (ownerId.toString() === userId) {
      response.isOwnerCompleted = false;
    } else {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // If either undone, swap is no longer fully completed
    if (response.isSwapCompleted && (!response.isApplicantCompleted || !response.isOwnerCompleted)) {
      response.isSwapCompleted = false;
      response.swapCompletedAt = null;
    }

    await response.save();

    // Notify the other user that completion was undone
    try {
      const otherUserId = response.applicant._id.toString() === userId ? ownerId : response.applicant._id;
      await Notification.create({
        recipient: otherUserId,
        sender: userId,
        type: 'session_completed',
        title: 'Swap Completion Updated',
        message: 'The other participant has undone the completion confirmation. Please coordinate and confirm again when ready.',
        relatedOffer: response.offerID,
        relatedRequest: response.requestID,
        actionUrl: response.offerID ? `/offers/${response.offerID._id}` : `/requests/${response.requestID._id}`
      });
    } catch (notifErr) {
      console.error('Error creating undo notification:', notifErr);
    }

    res.json({ message: 'Undo successful', response });
  } catch (error) {
    console.error('Error undoing swap complete:', error);
    res.status(500).json({ error: 'Failed to undo completion' });
  }
};

// Complete an application/trade
export const completeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const response = await Response.findById(id)
      .populate('offerID', 'user title')
      .populate('requestID', 'user title')
      .populate('applicant', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (response.status !== 'accepted') {
      return res.status(400).json({ error: 'Application must be accepted before it can be completed' });
    }

    if (response.isCompleted) {
      return res.status(400).json({ error: 'Application is already completed' });
    }

    // Determine who can complete based on response type
    let canComplete = false;
    let shouldCompleteOriginalPost = false;

    if (response.responseType === 'offer') {
      // For offers: Only the applicant can complete
      canComplete = response.applicant._id.toString() === userId;
      shouldCompleteOriginalPost = false; // Offers remain available after completion
    } else if (response.responseType === 'request') {
      // For requests: Only the request owner can complete
      canComplete = response.requestID?.user.toString() === userId;
      shouldCompleteOriginalPost = true; // Requests are completed after help is received
    }

    if (!canComplete) {
      const errorMsg = response.responseType === 'offer' 
        ? 'Only the applicant can complete this application'
        : 'Only the request owner can complete this application';
      return res.status(403).json({ error: errorMsg });
    }

    // Mark application as completed
    response.isCompleted = true;
    response.completedBy = userId;
    response.completedAt = new Date();
    response.status = 'completed';
    await response.save();

    // Complete the original request if needed
    if (shouldCompleteOriginalPost && response.requestID) {
      await Request.findByIdAndUpdate(response.requestID._id, { 
        status: 'completed' 
      });
    }

    // Create completion notifications
    try {
      const title = response.offerID?.title || response.requestID?.title;
      
      if (response.responseType === 'offer') {
        // Notify offer owner that applicant completed the task
        await Notification.create({
          recipient: response.offerID.user,
          sender: userId,
          type: 'session_completed',
          title: 'Application Completed',
          message: `${response.applicant.name} has completed the application for "${title}"`,
          relatedOffer: response.offerID._id,
          relatedResponse: response._id,
          actionUrl: `/applications/${response._id}`
        });
      } else if (response.responseType === 'request') {
        // Notify helper that request owner marked request as completed
        await Notification.create({
          recipient: response.applicant._id,
          sender: userId,
          type: 'session_completed',
          title: 'Request Completed',
          message: `The request "${title}" has been marked as completed. Thank you for your help!`,
          relatedRequest: response.requestID._id,
          relatedResponse: response._id,
          actionUrl: `/applications/${response._id}`
        });
      }
    } catch (notifError) {
      console.error('Error creating completion notification:', notifError);
      // Continue even if notification fails
    }

    res.json({ 
      message: 'Application completed successfully',
      response,
      originalPostCompleted: shouldCompleteOriginalPost
    });
  } catch (error) {
    console.error('Error completing application:', error);
    res.status(500).json({ error: 'Failed to complete application' });
  }
};

// Get a specific application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Response.findById(id)
      .populate('applicant', 'name email profilePicture')
      .populate('offerID', 'title description user category')
      .populate('requestID', 'title description user category')
      .populate({
        path: 'offerID',
        populate: { path: 'user', select: 'name email profilePicture' }
      })
      .populate({
        path: 'requestID', 
        populate: { path: 'user', select: 'name email profilePicture' }
      })
      .populate('completedBy', 'name email');

    if (!response) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

// Get all responses sent by a user (applications they sent)
export const getUserSentResponses = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = { applicant: userId };
    if (status) {
      query.status = status;
    }

    const responses = await Response.find(query)
      .populate('offerID', 'title user category university')
      .populate('requestID', 'title user category university')
      .populate({
        path: 'offerID',
        populate: { path: 'user', select: 'name email profilePicture' }
      })
      .populate({
        path: 'requestID',
        populate: { path: 'user', select: 'name email profilePicture' }
      })
      .sort({ createdAt: -1 });

    res.json({ responses, count: responses.length });
  } catch (error) {
    console.error('Error fetching user sent responses:', error);
    res.status(500).json({ error: 'Failed to fetch sent responses' });
  }
};