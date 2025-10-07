import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    default: '',
    trim: true
  },
  instituteName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pursuing'],
    required: true
  },
  completionYear: {
    type: Number,
    required: function() {
      return this.status === 'Completed';
    }
  },
  expectedCompletionYear: {
    type: Number,
    required: function() {
      return this.status === 'Pursuing';
    }
  },
  grade: {
    type: String,
    default: '',
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Education = mongoose.model('Education', educationSchema);

export default Education;
