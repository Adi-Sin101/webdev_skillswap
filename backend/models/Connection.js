import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ignored'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a user can't send multiple requests to the same person
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Prevent self-connections
connectionSchema.pre('save', function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    const error = new Error('Users cannot connect to themselves');
    return next(error);
  }
  next();
});

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
