import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  
  // Skill and Experience
  skillLevel: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"], 
    default: "Intermediate" 
  },
  prerequisites: String,
  whatYouWillLearn: [String],
  
  // Session Details
  sessionType: { 
    type: String, 
    enum: ["One-time", "Multiple sessions", "Ongoing support"], 
    default: "One-time" 
  },
  sessionDuration: String, // e.g., "2 hours per session"
  totalDuration: String, // e.g., "2 weeks", "1 month"
  
  // Delivery and Location
  deliveryMethod: { 
    type: String, 
    enum: ["In-person", "Online", "Both"], 
    default: "Both" 
  },
  location: String, // Only used if deliveryMethod includes "In-person"
  
  // Availability and Scheduling
  availability: String,
  preferredSchedule: String,
  
  // Capacity and Pricing
  maxStudents: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  
  // Additional Info
  tags: [String],
  
  // Status
  status: { 
    type: String, 
    enum: ["pending", "completed"], 
    default: "pending" 
  },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Offer", OfferSchema);