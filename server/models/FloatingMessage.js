import mongoose from 'mongoose';

const floatingMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  highlightText: {
    type: String,
    trim: true,
    maxLength: 50,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
floatingMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const FloatingMessage = mongoose.model('FloatingMessage', floatingMessageSchema);

export default FloatingMessage;
