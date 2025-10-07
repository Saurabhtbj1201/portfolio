import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
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
  detailedDescription: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Completed'],
    required: true
  },
  completionMonth: {
    type: String,
    required: function() {
      return this.status === 'Completed';
    }
  },
  completionYear: {
    type: Number,
    required: function() {
      return this.status === 'Completed';
    }
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  links: [{
    type: {
      type: String,
      enum: ['Live', 'GitHub', 'LinkedIn', 'YouTube', 'Twitter', 'Medium', 'Product Hunt', 'Custom'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    customName: {
      type: String,
      required: function() {
        return this.type === 'Custom';
      }
    }
  }],
  showOnHome: {
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

const Project = mongoose.model('Project', projectSchema);

export default Project;
