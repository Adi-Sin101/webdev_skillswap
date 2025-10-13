import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  availability: String,
  date: String,
  location: String,
  type: { type: String, enum: ["Free","Paid"], default: "Free" },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Offer", OfferSchema);