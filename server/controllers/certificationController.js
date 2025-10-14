import Certification from '../models/Certification.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
export const getCertifications = async (req, res) => {
  try {
    const { pinned } = req.query;
    
    let query = {};
    if (pinned === 'true') {
      query.pinned = true;
    }

    const certifications = await Certification.find(query)
      .sort({ pinned: -1, order: 1, completionYear: -1, createdAt: -1 });

    res.json(certifications);
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certification by ID
// @route   GET /api/certifications/:id
// @access  Public
export const getCertificationById = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    res.json(certification);
  } catch (error) {
    console.error('Get certification by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create certification
// @route   POST /api/certifications
// @access  Private
export const createCertification = async (req, res) => {
  try {
    const {
      title,
      organization,
      completionMonth,
      completionYear,
      credentialId,
      credentialUrl,
      description,
      skills,
      pinned
    } = req.body;

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
        const isPdf = fileExtension === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

        const certResult = await new Promise((resolve, reject) => {
          const uploadOptions = {
            folder: 'portfolio/certifications/certificates',
            public_id: `certificate_${Date.now()}`,
          };

          // Set resource type and format based on file type
          if (isPdf) {
            uploadOptions.resource_type = 'raw';
            uploadOptions.format = 'pdf';
          } else if (isImage) {
            uploadOptions.resource_type = 'image';
            uploadOptions.format = fileExtension;
          } else {
            uploadOptions.resource_type = 'raw';
            // Don't set format for other file types
          }

          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
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
              folder: 'portfolio/certifications/images',
              resource_type: 'image',
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

    // Parse skills
    let parsedSkills = [];
    if (skills) {
      parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    const certification = await Certification.create({
      title: title.trim(),
      organization: organization.trim(),
      completionMonth,
      completionYear: parseInt(completionYear),
      credentialId: credentialId || '',
      credentialUrl: credentialUrl || '',
      certificate,
      certificatePublicId,
      image,
      imagePublicId,
      description: description?.trim() || '',
      skills: parsedSkills,
      pinned: pinned === 'true' || pinned === true
    });

    res.status(201).json({
      message: 'Certification created successfully',
      certification
    });
  } catch (error) {
    console.error('Create certification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private
export const updateCertification = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    const {
      title,
      organization,
      completionMonth,
      completionYear,
      credentialId,
      credentialUrl,
      description,
      skills,
      pinned,
      useExistingOrgImage,
      existingOrgImageUrl
    } = req.body;

    // Handle file uploads
    if (req.files) {
      // Update certificate
      if (req.files.certificate) {
        // Delete old certificate with proper resource type detection
        if (certification.certificatePublicId) {
          try {
            // Determine resource type from URL or public ID
            const isRawFile = certification.certificate && 
              (certification.certificate.includes('.pdf') || 
               certification.certificatePublicId.includes('certificate_'));
            
            const deleteOptions = {
              resource_type: isRawFile ? 'raw' : 'image'
            };

            console.log(`Deleting old certificate: ${certification.certificatePublicId}, resource_type: ${deleteOptions.resource_type}`);
            
            await cloudinary.uploader.destroy(certification.certificatePublicId, deleteOptions);
          } catch (error) {
            console.error('Error deleting old certificate:', error);
            // Continue with upload even if deletion fails
          }
        }

        const file = req.files.certificate[0];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        const isPdf = fileExtension === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

        const certResult = await new Promise((resolve, reject) => {
          const uploadOptions = {
            folder: 'portfolio/certifications/certificates',
            public_id: `certificate_${Date.now()}`,
          };

          // Set resource type and format based on file type
          if (isPdf) {
            uploadOptions.resource_type = 'raw';
            uploadOptions.format = 'pdf';
          } else if (isImage) {
            uploadOptions.resource_type = 'image';
            uploadOptions.format = fileExtension;
          } else {
            uploadOptions.resource_type = 'raw';
            // Don't set format for other file types
          }

          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        
        certification.certificate = certResult.secure_url;
        certification.certificatePublicId = certResult.public_id;
      }

      // Update image
      if (req.files.image) {
        // Delete old image only if it's owned by this certification
        if (certification.imagePublicId) {
          try {
            console.log(`Deleting old image: ${certification.imagePublicId}`);
            await cloudinary.uploader.destroy(certification.imagePublicId, { resource_type: 'image' });
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with upload even if deletion fails
          }
        }

        const imageResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'portfolio/certifications/images',
              resource_type: 'image',
              transformation: [{ width: 400, height: 400, crop: 'fill' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.files.image[0].buffer);
        });
        certification.image = imageResult.secure_url;
        certification.imagePublicId = imageResult.public_id;
      }
    }

    // Handle organization image reuse
    if (useExistingOrgImage === 'true' && existingOrgImageUrl && !req.files?.image) {
      // If using existing organization image and no new image uploaded
      // Clear the public ID since we don't own this image
      if (certification.imagePublicId) {
        // Don't delete the image from Cloudinary since it might be used by other certifications
        certification.imagePublicId = '';
      }
      certification.image = existingOrgImageUrl;
    }

    // Update fields
    certification.title = title?.trim() || certification.title;
    certification.organization = organization?.trim() || certification.organization;
    certification.completionMonth = completionMonth || certification.completionMonth;
    certification.completionYear = completionYear ? parseInt(completionYear) : certification.completionYear;
    certification.credentialId = credentialId !== undefined ? credentialId : certification.credentialId;
    certification.credentialUrl = credentialUrl !== undefined ? credentialUrl : certification.credentialUrl;
    certification.description = description !== undefined ? description?.trim() : certification.description;
    certification.pinned = pinned !== undefined ? (pinned === 'true' || pinned === true) : certification.pinned;

    // Parse and update skills
    if (skills !== undefined) {
      certification.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }

    await certification.save();

    res.json({
      message: 'Certification updated successfully',
      certification
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private
export const deleteCertification = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    // Delete files from Cloudinary
    const deletePromises = [];
    
    // Delete certificate file if exists
    if (certification.certificatePublicId) {
      try {
        // Better detection of resource type
        const isRawFile = certification.certificate && 
          (certification.certificate.includes('.pdf') || 
           certification.certificate.includes('/raw/') ||
           certification.certificatePublicId.includes('certificate_') ||
           !certification.certificate.includes('/image/'));
        
        const resourceType = isRawFile ? 'raw' : 'image';
        
        console.log(`Deleting certificate: ${certification.certificatePublicId}, resource_type: ${resourceType}`);
        console.log(`Certificate URL: ${certification.certificate}`);
        
        deletePromises.push(
          cloudinary.uploader.destroy(
            certification.certificatePublicId, 
            { resource_type: resourceType }
          ).then(result => {
            console.log(`Certificate deletion result:`, result);
            return result;
          }).catch(error => {
            console.error(`Failed to delete certificate ${certification.certificatePublicId}:`, error);
            // Continue with deletion even if Cloudinary fails
            return { result: 'error', error };
          })
        );
      } catch (error) {
        console.error('Error preparing certificate deletion:', error);
      }
    }
    
    // Delete image file if exists and it's owned by this certification
    if (certification.imagePublicId) {
      try {
        console.log(`Deleting image: ${certification.imagePublicId}`);
        
        deletePromises.push(
          cloudinary.uploader.destroy(certification.imagePublicId, { resource_type: 'image' }).then(result => {
            console.log(`Image deletion result:`, result);
            return result;
          }).catch(error => {
            console.error(`Failed to delete image ${certification.imagePublicId}:`, error);
            // Continue with deletion even if Cloudinary fails
            return { result: 'error', error };
          })
        );
      } catch (error) {
        console.error('Error preparing image deletion:', error);
      }
    }

    // Wait for all deletions to complete (or fail)
    if (deletePromises.length > 0) {
      try {
        const results = await Promise.allSettled(deletePromises);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Cloudinary deletion ${index} failed:`, result.reason);
          } else {
            console.log(`Cloudinary deletion ${index} successful:`, result.value);
          }
        });
      } catch (error) {
        console.error('Error during Cloudinary deletions:', error);
        // Continue with database deletion even if Cloudinary operations fail
      }
    }

    // Delete from database
    await Certification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/certifications/:id/toggle-featured
// @access  Private
export const toggleFeatured = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    certification.featured = !certification.featured;
    await certification.save();

    res.json({
      message: `Certification ${certification.featured ? 'marked as featured' : 'removed from featured'}`,
      featured: certification.featured
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pinned status
// @route   PUT /api/certifications/:id/toggle-pinned
// @access  Private
export const togglePinned = async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    certification.pinned = !certification.pinned;
    await certification.save();

    res.json({
      message: `Certification ${certification.pinned ? 'pinned' : 'unpinned'}`,
      pinned: certification.pinned
    });
  } catch (error) {
    console.error('Toggle pinned error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update certifications order
// @route   PUT /api/certifications/reorder
// @access  Private
export const reorderCertifications = async (req, res) => {
  try {
    const { certifications } = req.body; // Array of { id, order }

    const updatePromises = certifications.map(({ id, order }) =>
      Certification.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Certifications reordered successfully' });
  } catch (error) {
    console.error('Reorder certifications error:', error);
    res.status(500).json({ message: error.message });
  }
};
