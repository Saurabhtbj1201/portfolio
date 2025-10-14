import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
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
  completionMonth: {
    type: String,
    required: true
  },
  completionYear: {
    type: Number,
    required: true
  },
  credentialId: {
    type: String,
    default: '',
    trim: true
  },
  credentialUrl: {
    type: String,
    default: '',
    trim: true
  },
  certificate: {
    type: String,
    default: ''
  },
  certificatePublicId: {
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
  description: {
    type: String,
    default: '',
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  pinned: {
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

const Certification = mongoose.model('Certification', certificationSchema);

export default Certification;
