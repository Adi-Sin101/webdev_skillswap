import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  // Who is responding
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // What they're responding to
  offerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: function() { return !this.requestID; }
  },
  
  requestID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: function() { return !this.offerID; }
  },
  
  // Response details
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contact information
  contactInfo: {
    email: String,
    phone: String,
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'platform'],
      default: 'email'
    }
  },
  
  // Availability
  availability: {
    type: String,
    required: true
  },
  
  // Proposed timeline
  proposedTimeline: String,
  
  // Status of the response
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Response type
  responseType: {
    type: String,
    enum: ['offer', 'request'],
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only respond once to the same offer/request
responseSchema.index({ applicant: 1, offerID: 1 }, { unique: true, sparse: true });
responseSchema.index({ applicant: 1, requestID: 1 }, { unique: true, sparse: true });

// Index for efficient queries
responseSchema.index({ offerID: 1, status: 1 });
responseSchema.index({ requestID: 1, status: 1 });
responseSchema.index({ applicant: 1, status: 1 });

export default mongoose.model('Response', responseSchema);