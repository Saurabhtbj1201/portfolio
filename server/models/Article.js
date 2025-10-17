import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  thumbnailPublicId: {
    type: String,
    default: ''
  },
  socialLinks: [{
    platform: {
      type: String,
      enum: ['Medium', 'Blogger', 'LinkedIn', 'Dev.to', 'Hashnode', 'Personal Blog', 'GitHub', 'Quora', 'Custom'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    customName: {
      type: String,
      required: function() {
        return this.platform === 'Custom';
      }
    }
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  publishedAt: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-set publishedAt when status changes to Published
articleSchema.pre('save', function(next) {
  if (this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (this.status === 'Draft') {
    this.publishedAt = undefined;
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
