import Response from "../models/Response.js";
import Offer from "../models/offer.js";
import Request from "../models/Request.js";
import mongoose from "mongoose";

export const applyToOffer = async (req, res) => {
  try {
    const { id: offerID } = req.params;
    const { 
      applicant, 
      message, 
      contactInfo, 
      availability, 
      proposedTimeline 
    } = req.body;

    // Check if offer exists
    const offer = await Offer.findById(offerID);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if user already applied
    const existingResponse = await Response.findOne({ 
      applicant, 
      offerID 
    });
    
    if (existingResponse) {
      return res.status(400).json({ error: 'You have already applied to this offer' });
    }

    // Create new response
    const response = new Response({
      applicant,
      offerID,
      message,
      contactInfo,
      availability,
      proposedTimeline,
      responseType: 'offer'
    });

    await response.save();
    
    // Populate applicant info for response
    await response.populate('applicant', 'name email');
    
    res.status(201).json({ 
      message: 'Application submitted successfully!',
      response 
    });
  } catch (error) {
    console.error('Error applying to offer:', error);
    res.status(500).json({ error: 'Failed to submit application' });
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

    // Check if request exists
    const request = await Request.findById(requestID);
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
      message,
      contactInfo,
      availability,
      proposedTimeline,
      responseType: 'request'
    });

    await response.save();
    
    // Populate applicant info for response
    await response.populate('applicant', 'name email');
    
    res.status(201).json({ 
      message: 'Offer to help submitted successfully!',
      response 
    });
  } catch (error) {
    console.error('Error applying to request:', error);
    res.status(500).json({ error: 'Failed to submit offer to help' });
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
    const { status } = req.body;

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

    res.json({ message: `Response ${status}`, response });
  } catch (error) {
    console.error('Error updating response status:', error);
    res.status(500).json({ error: 'Failed to update response status' });
  }
};