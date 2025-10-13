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
    github: String
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);