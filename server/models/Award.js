import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    required: true,
    trim: true
  },
  associatedWith: {
    type: {
      type: String,
      enum: ['experience', 'education', 'none'],
      required: true,
      default: 'none'
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: function() {
        return this.associatedWith.type !== 'none';
      }
    }
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  issueMonth: {
    type: String,
    required: true,
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },
  issueYear: {
    type: Number,
    required: true
  },
  certificate: {
    type: String,
    default: ''
  },
  certificatePublicId: {
    type: String,
    default: ''
  },
  certificateLink: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  socialLinks: [{
    platform: {
      type: String,
      enum: ['linkedin'],
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Award = mongoose.model('Award', awardSchema);

export default Award;

