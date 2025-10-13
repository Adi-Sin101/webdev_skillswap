import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  deadline: String,
  location: String,
  type: { type: String, enum: ["Free","Paid"], default: "Free" },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Request", RequestSchema);
