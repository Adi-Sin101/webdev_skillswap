import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: String,
  bio: String,
  skills: [String],
  avatar: String,
  social: {
    linkedin: String,
    github: String,
    email: String
  },
  // Add badges and rating fields used in frontend
  badges: { type: [String], default: ["New User"] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  completedActivities: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);