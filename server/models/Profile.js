import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  profileImage: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  resumePublicId: {
    type: String,
    default: ''
  },
  // About section fields
  title: {
    type: String,
    default: 'Full Stack Developer'
  },
  tags: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  place: {
    type: String,
    default: ''
  },
  aboutImage: {
    type: String,
    default: ''
  },
  aboutImagePublicId: {
    type: String,
    default: ''
  },
  // Logo fields
  logo: {
    type: String,
    default: ''
  },
  logoPublicId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
