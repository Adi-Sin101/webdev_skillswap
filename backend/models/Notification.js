import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  type: { 
    type: String, 
    enum: ["new_offer", "new_request", "offer_response", "request_response", "session_scheduled", "session_completed", "new_message", "badge_earned"],
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Related entities
  relatedOffer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  relatedConnection: { type: mongoose.Schema.Types.ObjectId, ref: "Connection" },
  
  isRead: { type: Boolean, default: false },
  actionUrl: String, // Where to redirect when clicked
  
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", NotificationSchema);