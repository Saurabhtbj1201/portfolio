import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Job', 'Internship', 'Freelance']
  },
  companyName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Ongoing', 'Completed'],
    default: 'Completed'
  },
  startMonth: {
    type: String,
    required: true
  },
  startYear: {
    type: Number,
    required: true
  },
  endMonth: {
    type: String
  },
  endYear: {
    type: Number
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  skillTags: [{
    type: String,
    trim: true
  }],
  companyLink: {
    type: String
  },
  companyLogo: {
    type: String
  },
  companyLogoPublicId: {
    type: String
  },
  offerLetter: {
    type: String
  },
  offerLetterPublicId: {
    type: String
  },
  completionCertificate: {
    type: String
  },
  completionCertificatePublicId: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Sort by order and then by start date (newest first)
experienceSchema.index({ order: 1, startYear: -1, startMonth: -1 });

export default mongoose.model('Experience', experienceSchema);
