import Experience from '../models/Experience.js';
import { Skill } from '../models/Skill.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find()
      .populate({
        path: 'technologies',
        select: 'name image',
        model: 'Skill'
      })
      .sort({ order: 1, startYear: -1, startMonth: -1 });
    
    res.json(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get experience by ID
// @route   GET /api/experiences/:id
// @access  Public
export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate({
        path: 'technologies',
        select: 'name image',
        model: 'Skill'
      });
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (error) {
    console.error('Get experience by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new experience
// @route   POST /api/experiences
// @access  Private
export const createExperience = async (req, res) => {
  try {
    const {
      category,
      companyName,
      role,
      employmentType,
      location,
      status,
      startMonth,
      startYear,
      endMonth,
      endYear,
      description,
      technologies,
      skillTags,
      companyLink
    } = req.body;

    // Validate technologies
    let validTechnologies = [];
    if (technologies && technologies.length > 0) {
      const techIds = JSON.parse(technologies);
      const foundTechs = await Skill.find({ _id: { $in: techIds } });
      validTechnologies = foundTechs.map(tech => tech._id);
    }

    // Parse skill tags
    let parsedSkillTags = [];
    if (skillTags) {
      parsedSkillTags = typeof skillTags === 'string' ? JSON.parse(skillTags) : skillTags;
      // Clean and filter skill tags
      parsedSkillTags = parsedSkillTags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Handle file uploads
    let companyLogo = '';
    let companyLogoPublicId = '';

    if (req.files && req.files.companyLogo) {
      const logoResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/experience/logos',
            transformation: [{ width: 200, height: 200, crop: 'fit' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.files.companyLogo[0].buffer);
      });
      companyLogo = logoResult.secure_url;
      companyLogoPublicId = logoResult.public_id;
    }

    const experience = await Experience.create({
      category,
      companyName,
      role,
      employmentType,
      location,
      status,
      startMonth,
      startYear,
      endMonth: status === 'Completed' ? endMonth : undefined,
      endYear: status === 'Completed' ? endYear : undefined,
      description,
      technologies: validTechnologies,
      skillTags: parsedSkillTags,
      companyLink,
      companyLogo,
      companyLogoPublicId
    });

    const populatedExperience = await Experience.findById(experience._id)
      .populate({
        path: 'technologies',
        select: 'name image',
        model: 'Skill'
      });

    res.status(201).json(populatedExperience);
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update experience
// @route   PUT /api/experiences/:id
// @access  Private
export const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const {
      category,
      companyName,
      role,
      employmentType,
      location,
      status,
      startMonth,
      startYear,
      endMonth,
      endYear,
      description,
      technologies,
      skillTags,
      companyLink
    } = req.body;

    // Validate technologies
    let validTechnologies = experience.technologies;
    if (technologies) {
      const techIds = JSON.parse(technologies);
      const foundTechs = await Skill.find({ _id: { $in: techIds } });
      validTechnologies = foundTechs.map(tech => tech._id);
    }

    // Parse skill tags
    let parsedSkillTags = experience.skillTags;
    if (skillTags !== undefined) {
      parsedSkillTags = typeof skillTags === 'string' ? JSON.parse(skillTags) : skillTags;
      // Clean and filter skill tags
      parsedSkillTags = parsedSkillTags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Handle company logo update
    if (req.files && req.files.companyLogo) {
      // Delete old logo
      if (experience.companyLogoPublicId) {
        await cloudinary.uploader.destroy(experience.companyLogoPublicId);
      }

      const logoResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/experience/logos',
            transformation: [{ width: 200, height: 200, crop: 'fit' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.files.companyLogo[0].buffer);
      });
      
      experience.companyLogo = logoResult.secure_url;
      experience.companyLogoPublicId = logoResult.public_id;
    }

    // Update fields
    experience.category = category || experience.category;
    experience.companyName = companyName || experience.companyName;
    experience.role = role || experience.role;
    experience.employmentType = employmentType || experience.employmentType;
    experience.location = location || experience.location;
    experience.status = status || experience.status;
    experience.startMonth = startMonth || experience.startMonth;
    experience.startYear = startYear || experience.startYear;
    experience.endMonth = status === 'Completed' ? endMonth : undefined;
    experience.endYear = status === 'Completed' ? endYear : undefined;
    experience.description = description || experience.description;
    experience.technologies = validTechnologies;
    experience.skillTags = parsedSkillTags;
    experience.companyLink = companyLink !== undefined ? companyLink : experience.companyLink;

    await experience.save();

    const updatedExperience = await Experience.findById(experience._id)
      .populate({
        path: 'technologies',
        select: 'name image',
        model: 'Skill'
      });

    res.json(updatedExperience);
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete experience
// @route   DELETE /api/experiences/:id
// @access  Private
export const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Delete files from Cloudinary
    const deletePromises = [];
    
    if (experience.companyLogoPublicId) {
      deletePromises.push(cloudinary.uploader.destroy(experience.companyLogoPublicId));
    }
    if (experience.offerLetterPublicId) {
      deletePromises.push(cloudinary.uploader.destroy(experience.offerLetterPublicId, { resource_type: 'raw' }));
    }
    if (experience.completionCertificatePublicId) {
      deletePromises.push(cloudinary.uploader.destroy(experience.completionCertificatePublicId, { resource_type: 'raw' }));
    }

    await Promise.all(deletePromises);
    await Experience.findByIdAndDelete(req.params.id);

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload offer letter
// @route   POST /api/experiences/:id/offer-letter
// @access  Private
export const uploadOfferLetter = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old offer letter
    if (experience.offerLetterPublicId) {
      await cloudinary.uploader.destroy(experience.offerLetterPublicId, { resource_type: 'raw' });
    }

    // Determine file extension
    const fileExtension = req.file.originalname.split('.').pop() || 'pdf';
    const fileName = `offer_letter_${experience._id}_${Date.now()}.${fileExtension}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/experience/offer-letters',
          resource_type: 'raw',
          public_id: fileName,
          format: fileExtension
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    experience.offerLetter = result.secure_url;
    experience.offerLetterPublicId = result.public_id;
    await experience.save();

    res.json({
      message: 'Offer letter uploaded successfully',
      offerLetter: result.secure_url
    });
  } catch (error) {
    console.error('Upload offer letter error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload completion certificate
// @route   POST /api/experiences/:id/completion-certificate
// @access  Private
export const uploadCompletionCertificate = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old certificate
    if (experience.completionCertificatePublicId) {
      await cloudinary.uploader.destroy(experience.completionCertificatePublicId, { resource_type: 'raw' });
    }

    // Determine file extension
    const fileExtension = req.file.originalname.split('.').pop() || 'pdf';
    const fileName = `certificate_${experience._id}_${Date.now()}.${fileExtension}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/experience/certificates',
          resource_type: 'raw',
          public_id: fileName,
          format: fileExtension
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    experience.completionCertificate = result.secure_url;
    experience.completionCertificatePublicId = result.public_id;
    await experience.save();

    res.json({
      message: 'Completion certificate uploaded successfully',
      completionCertificate: result.secure_url
    });
  } catch (error) {
    console.error('Upload completion certificate error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder experiences
// @route   PUT /api/experiences/reorder
// @access  Private
export const reorderExperiences = async (req, res) => {
  try {
    const { experiences } = req.body;

    const updatePromises = experiences.map((exp, index) =>
      Experience.findByIdAndUpdate(exp._id, { order: index })
    );

    await Promise.all(updatePromises);

    const reorderedExperiences = await Experience.find()
      .populate('technologies', 'name image')
      .sort({ order: 1, startYear: -1, startMonth: -1 });

    res.json(reorderedExperiences);
  } catch (error) {
    console.error('Reorder experiences error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete offer letter
// @route   DELETE /api/experiences/:id/offer-letter
// @access  Private
export const deleteOfferLetter = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (!experience.offerLetterPublicId) {
      return res.status(404).json({ message: 'No offer letter found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(experience.offerLetterPublicId, { resource_type: 'raw' });

    // Update database
    experience.offerLetter = '';
    experience.offerLetterPublicId = '';
    await experience.save();

    res.json({
      message: 'Offer letter deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer letter error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete completion certificate
// @route   DELETE /api/experiences/:id/completion-certificate
// @access  Private
export const deleteCompletionCertificate = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (!experience.completionCertificatePublicId) {
      return res.status(404).json({ message: 'No completion certificate found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(experience.completionCertificatePublicId, { resource_type: 'raw' });

    // Update database
    experience.completionCertificate = '';
    experience.completionCertificatePublicId = '';
    await experience.save();

    res.json({
      message: 'Completion certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete completion certificate error:', error);
    res.status(500).json({ message: error.message });
  }
};
