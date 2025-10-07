import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pageview', 'visit', 'click', 'event'],
    required: true
  },
  page: {
    type: String,
    default: '/'
  },
  referrer: String,
  userAgent: String,
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },
  browser: String,
  os: String,
  country: String,
  city: String,
  ip: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ type: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
