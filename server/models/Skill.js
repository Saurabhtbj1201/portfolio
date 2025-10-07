import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillCategory',
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const skillCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#667eea'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);
const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);

export { Skill, SkillCategory };
