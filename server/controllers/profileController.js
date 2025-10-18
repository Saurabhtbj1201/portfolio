import Profile from '../models/Profile.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get profile
// @route   GET /api/profile
// @access  Public
export const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    
    console.log('Profile fetched:', {
      hasImage: !!profile.profileImage,
      imageUrl: profile.profileImage,
      hasAboutImage: !!profile.aboutImage,
      aboutImageUrl: profile.aboutImage
    });
    
    res.json({
      _id: profile._id,
      profileImage: profile.profileImage || '',
      resume: profile.resume || '',
      title: profile.title || 'Full Stack Developer',
      tags: profile.tags || [],
      description: profile.description || '',
      email: profile.email || '',
      place: profile.place || '',
      aboutImage: profile.aboutImage || '',
      logo: profile.logo || '',
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile image
// @route   POST /api/profile/upload-image
// @access  Private
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/profile',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    let profile = await Profile.findOne();
    
    // Delete old image if exists
    if (profile && profile.profileImagePublicId) {
      await cloudinary.uploader.destroy(profile.profileImagePublicId);
    }

    if (!profile) {
      profile = new Profile();
    }

    profile.profileImage = result.secure_url;
    profile.profileImagePublicId = result.public_id;
    await profile.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete profile image
// @route   DELETE /api/profile/image
// @access  Private
export const deleteProfileImage = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile || !profile.profileImagePublicId) {
      return res.status(404).json({ message: 'No profile image found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.profileImagePublicId);

    // Update database
    profile.profileImage = '';
    profile.profileImagePublicId = '';
    await profile.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload resume
// @route   POST /api/profile/upload-resume
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary as raw file
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/resume',
          resource_type: 'raw',
          public_id: `resume_${Date.now()}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    let profile = await Profile.findOne();
    
    // Delete old resume if exists
    if (profile && profile.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
      } catch (deleteError) {
        console.error('Error deleting old resume:', deleteError);
      }
    }

    if (!profile) {
      profile = new Profile();
    }

    profile.resume = result.secure_url;
    profile.resumePublicId = result.public_id;
    await profile.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: result.secure_url
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/profile/resume
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile || !profile.resumePublicId) {
      return res.status(404).json({ message: 'No resume found' });
    }

    // Delete from Cloudinary with resource_type: 'raw' for PDF files
    try {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Update database
    profile.resume = '';
    profile.resumePublicId = '';
    await profile.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload about image
// @route   POST /api/profile/upload-about-image
// @access  Private
export const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/about',
          transformation: [
            { width: 800, height: 1000, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    let profile = await Profile.findOne();
    
    // Delete old about image if exists
    if (profile && profile.aboutImagePublicId) {
      await cloudinary.uploader.destroy(profile.aboutImagePublicId);
    }

    if (!profile) {
      profile = new Profile();
    }

    profile.aboutImage = result.secure_url;
    profile.aboutImagePublicId = result.public_id;
    await profile.save();

    res.json({
      message: 'About image uploaded successfully',
      aboutImage: result.secure_url
    });
  } catch (error) {
    console.error('About image upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete about image
// @route   DELETE /api/profile/about-image
// @access  Private
export const deleteAboutImage = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile || !profile.aboutImagePublicId) {
      return res.status(404).json({ message: 'No about image found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.aboutImagePublicId);

    // Update database
    profile.aboutImage = '';
    profile.aboutImagePublicId = '';
    await profile.save();

    res.json({ message: 'About image deleted successfully' });
  } catch (error) {
    console.error('Delete about image error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload logo
// @route   POST /api/profile/upload-logo
// @access  Private
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/logo',
          transformation: [
            { width: 200, height: 200, crop: 'fit', format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    let profile = await Profile.findOne();
    
    // Delete old logo if exists
    if (profile && profile.logoPublicId) {
      await cloudinary.uploader.destroy(profile.logoPublicId);
    }

    if (!profile) {
      profile = new Profile();
    }

    profile.logo = result.secure_url;
    profile.logoPublicId = result.public_id;
    await profile.save();

    res.json({
      message: 'Logo uploaded successfully',
      logo: result.secure_url
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete logo
// @route   DELETE /api/profile/logo
// @access  Private
export const deleteLogo = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile || !profile.logoPublicId) {
      return res.status(404).json({ message: 'No logo found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(profile.logoPublicId);

    // Update database
    profile.logo = '';
    profile.logoPublicId = '';
    await profile.save();

    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update about section
// @route   PUT /api/profile/about
// @access  Private
export const updateAbout = async (req, res) => {
  try {
    const { title, tags, description, email, place } = req.body;

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }

    // Update fields only if provided
    if (title !== undefined) profile.title = title;
    if (tags !== undefined) profile.tags = Array.isArray(tags) ? tags : [];
    if (description !== undefined) profile.description = description;
    if (email !== undefined) profile.email = email;
    if (place !== undefined) profile.place = place;

    await profile.save();

    res.json({
      message: 'About section updated successfully',
      profile: {
        title: profile.title,
        tags: profile.tags,
        description: profile.description,
        email: profile.email,
        place: profile.place,
        aboutImage: profile.aboutImage
      }
    });
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({ message: error.message });
  }
};
