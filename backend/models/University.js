import mongoose from 'mongoose';

const UniversitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  city: String,
  state: String,
  country: { 
    type: String, 
    default: 'USA' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes for efficient searching (removed duplicate name index since unique:true already creates one)
UniversitySchema.index({ location: 1 });
UniversitySchema.index({ city: 1 });

export default mongoose.model('University', UniversitySchema);
