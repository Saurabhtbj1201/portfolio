import Award from '../models/Award.js';
import Experience from '../models/Experience.js';
import Education from '../models/Education.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create award
// @route   POST /api/awards
// @access  Private
export const createAward = async (req, res) => {
  try {
    const {
      title,
      organization,
      associatedWithType,
      associatedWithId,
      description,
      issueMonth,
      issueYear,
      certificateLink,
      socialLinks,
      featured
    } = req.body;

    // Validate associated entity exists (only if not 'none')
    if (associatedWithType !== 'none') {
      let associatedEntity;
      if (associatedWithType === 'experience') {
        associatedEntity = await Experience.findById(associatedWithId);
      } else if (associatedWithType === 'education') {
        associatedEntity = await Education.findById(associatedWithId);
      }

      if (!associatedEntity) {
        return res.status(404).json({ message: 'Associated entity not found' });
      }
    }

    // Handle file uploads
    let certificate = '';
    let certificatePublicId = '';
    let image = '';
    let imagePublicId = '';

    if (req.files) {
      // Upload certificate
      if (req.files.certificate) {
        const file = req.files.certificate[0];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        
        const certResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio/awards/certificates',
              resource_type: 'raw',
              public_id: `certificate_${Date.now()}`,
              format: fileExtension
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        certificate = certResult.secure_url;
        certificatePublicId = certResult.public_id;
      }

      // Upload image
      if (req.files.image) {
        const imageResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio/awards/images',
              transformation: [{ width: 400, height: 400, crop: 'fill' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.files.image[0].buffer);
        });
        image = imageResult.secure_url;
        imagePublicId = imageResult.public_id;
      }
    }

    // Parse social links
    let parsedSocialLinks = [];
    if (socialLinks) {
      parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }

    const awardData = {
      title: title.trim(),
      organization: organization.trim(),
      associatedWith: {
        type: associatedWithType,
        id: associatedWithType !== 'none' ? associatedWithId : undefined
      },
      description: description.trim(),
      issueMonth,
      issueYear: parseInt(issueYear),
      certificate,
      certificatePublicId,
      certificateLink: certificateLink || '',
      image,
      imagePublicId,
      socialLinks: parsedSocialLinks,
      featured: featured === 'true' || featured === true
    };

    const award = await Award.create(awardData);

    // Manually populate the associated entity if not 'none'
    let populatedAward = award.toObject();
    if (associatedWithType !== 'none' && associatedWithId) {
      let associatedEntity;
      if (associatedWithType === 'experience') {
        associatedEntity = await Experience.findById(associatedWithId)
          .select('companyName role startMonth startYear endMonth endYear status');
      } else if (associatedWithType === 'education') {
        associatedEntity = await Education.findById(associatedWithId)
          .select('instituteName degree course startYear endYear status');
      }
      
      if (associatedEntity) {
        populatedAward.associatedWith.id = associatedEntity;
      }
    }

    res.status(201).json({
      message: 'Award created successfully',
      award: populatedAward
    });
  } catch (error) {
    console.error('Create award error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all awards
// @route   GET /api/awards
// @access  Public
export const getAwards = async (req, res) => {
  try {
    const { featured } = req.query;
    
    let query = {};
    if (featured === 'true') {
      query.featured = true;
    }

    const awards = await Award.find(query)
      .sort({ order: 1, issueYear: -1, createdAt: -1 });

    // Manually populate associated entities
    const populatedAwards = await Promise.all(
      awards.map(async (award) => {
        const awardObj = award.toObject();
        
        if (award.associatedWith.type !== 'none' && award.associatedWith.id) {
          let associatedEntity;
          if (award.associatedWith.type === 'experience') {
            associatedEntity = await Experience.findById(award.associatedWith.id)
              .select('companyName role startMonth startYear endMonth endYear status');
          } else if (award.associatedWith.type === 'education') {
            associatedEntity = await Education.findById(award.associatedWith.id)
              .select('instituteName degree course startYear endYear status');
          }
          
          if (associatedEntity) {
            awardObj.associatedWith.id = associatedEntity;
          }
        }
        
        return awardObj;
      })
    );

    res.json(populatedAwards);
  } catch (error) {
    console.error('Get awards error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get award by ID
// @route   GET /api/awards/:id
// @access  Public
export const getAwardById = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    // Manually populate associated entity
    let populatedAward = award.toObject();
    if (award.associatedWith.type !== 'none' && award.associatedWith.id) {
      let associatedEntity;
      if (award.associatedWith.type === 'experience') {
        associatedEntity = await Experience.findById(award.associatedWith.id)
          .select('companyName role startMonth startYear endMonth endYear status');
      } else if (award.associatedWith.type === 'education') {
        associatedEntity = await Education.findById(award.associatedWith.id)
          .select('instituteName degree course startYear endYear status');
      }
      
      if (associatedEntity) {
        populatedAward.associatedWith.id = associatedEntity;
      }
    }

    res.json(populatedAward);
  } catch (error) {
    console.error('Get award by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update award
// @route   PUT /api/awards/:id
// @access  Private
export const updateAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    const {
      title,
      organization,
      associatedWithType,
      associatedWithId,
      description,
      issueMonth,
      issueYear,
      certificateLink,
      socialLinks,
      featured
    } = req.body;

    // Validate associated entity if changed (only if not 'none')
    if (associatedWithType && associatedWithType !== 'none' && associatedWithId) {
      let associatedEntity;
      if (associatedWithType === 'experience') {
        associatedEntity = await Experience.findById(associatedWithId);
      } else if (associatedWithType === 'education') {
        associatedEntity = await Education.findById(associatedWithId);
      }

      if (!associatedEntity) {
        return res.status(404).json({ message: 'Associated entity not found' });
      }
    }

    // Handle file uploads
    if (req.files) {
      // Update certificate
      if (req.files.certificate) {
        // Delete old certificate
        if (award.certificatePublicId) {
          await cloudinary.uploader.destroy(award.certificatePublicId, { resource_type: 'raw' });
        }

        const file = req.files.certificate[0];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();

        const certResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio/awards/certificates',
              resource_type: 'raw',
              public_id: `certificate_${Date.now()}`,
              format: fileExtension
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        award.certificate = certResult.secure_url;
        award.certificatePublicId = certResult.public_id;
      }

      // Update image
      if (req.files.image) {
        // Delete old image
        if (award.imagePublicId) {
          await cloudinary.uploader.destroy(award.imagePublicId);
        }

        const imageResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio/awards/images',
              transformation: [{ width: 600, height: 600, crop: 'fill' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.files.image[0].buffer);
        });
        award.image = imageResult.secure_url;
        award.imagePublicId = imageResult.public_id;
      }
    }

    // Update fields
    award.title = title?.trim() || award.title;
    award.organization = organization?.trim() || award.organization;
    
    if (associatedWithType) {
      award.associatedWith = {
        type: associatedWithType,
        id: associatedWithType !== 'none' ? associatedWithId : undefined
      };
    }
    
    award.description = description?.trim() || award.description;
    award.issueMonth = issueMonth || award.issueMonth;
    award.issueYear = issueYear ? parseInt(issueYear) : award.issueYear;
    award.certificateLink = certificateLink !== undefined ? certificateLink : award.certificateLink;
    award.featured = featured !== undefined ? (featured === 'true' || featured === true) : award.featured;

    // Parse and update social links
    if (socialLinks !== undefined) {
      award.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }

    await award.save();
    
    // Manually populate associated entity
    let populatedAward = award.toObject();
    if (award.associatedWith.type !== 'none' && award.associatedWith.id) {
      let associatedEntity;
      if (award.associatedWith.type === 'experience') {
        associatedEntity = await Experience.findById(award.associatedWith.id)
          .select('companyName role startMonth startYear endMonth endYear status');
      } else if (award.associatedWith.type === 'education') {
        associatedEntity = await Education.findById(award.associatedWith.id)
          .select('instituteName degree course startYear endYear status');
      }
      
      if (associatedEntity) {
        populatedAward.associatedWith.id = associatedEntity;
      }
    }

    res.json({
      message: 'Award updated successfully',
      award: populatedAward
    });
  } catch (error) {
    console.error('Update award error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete award
// @route   DELETE /api/awards/:id
// @access  Private
export const deleteAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    // Delete files from Cloudinary
    const deletePromises = [];
    
    if (award.certificatePublicId) {
      deletePromises.push(cloudinary.uploader.destroy(award.certificatePublicId, { resource_type: 'raw' }));
    }
    if (award.imagePublicId) {
      deletePromises.push(cloudinary.uploader.destroy(award.imagePublicId));
    }

    await Promise.all(deletePromises);
    await Award.findByIdAndDelete(req.params.id);

    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Delete award error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get experiences and education for association
// @route   GET /api/awards/data/associations
// @access  Private
export const getAssociations = async (req, res) => {
  try {
    const experiences = await Experience.find()
      .select('companyName role startMonth startYear endMonth endYear status')
      .sort({ startYear: -1 });

    const education = await Education.find()
      .select('instituteName degree course startYear endYear status')
      .sort({ startYear: -1 });

    res.json({
      experiences,
      education
    });
  } catch (error) {
    console.error('Get associations error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/awards/:id/toggle-featured
// @access  Private
export const toggleFeatured = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    award.featured = !award.featured;
    await award.save();

    res.json({
      message: `Award ${award.featured ? 'marked as featured' : 'removed from featured'}`,
      featured: award.featured
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: error.message });
  }
};
