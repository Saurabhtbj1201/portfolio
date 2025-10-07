import Education from '../models/Education.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all education records
// @route   GET /api/education
// @access  Public
export const getEducation = async (req, res) => {
  try {
    const education = await Education.find().sort({ order: 1, createdAt: -1 });
    res.json(education);
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create education record
// @route   POST /api/education
// @access  Private
export const createEducation = async (req, res) => {
  try {
    const { degree, specialization, instituteName, location, status, completionYear, expectedCompletionYear, grade } = req.body;

    // Validate required fields
    if (!degree || !instituteName || !status) {
      return res.status(400).json({ message: 'Degree, institute name, and status are required' });
    }

    // Validate status-specific fields
    if (status === 'Completed' && !completionYear) {
      return res.status(400).json({ message: 'Completion year is required for completed education' });
    }

    if (status === 'Pursuing' && !expectedCompletionYear) {
      return res.status(400).json({ message: 'Expected completion year is required for pursuing education' });
    }

    // Handle logo upload if provided
    let logoUrl = '';
    let logoPublicId = '';
    
    if (req.file) {
      // Upload image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/education',
            transformation: [
              { width: 1280, height: 720, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      logoUrl = result.secure_url;
      logoPublicId = result.public_id;
    }

    const education = await Education.create({
      degree: degree.trim(),
      specialization: specialization?.trim() || '',
      instituteName: instituteName.trim(),
      location: location?.trim() || '',
      status,
      completionYear: status === 'Completed' ? completionYear : undefined,
      expectedCompletionYear: status === 'Pursuing' ? expectedCompletionYear : undefined,
      grade: grade?.trim() || '',
      logo: logoUrl,
      logoPublicId: logoPublicId
    });

    res.status(201).json({
      message: 'Education record created successfully',
      education
    });
  } catch (error) {
    console.error('Create education error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update education record
// @route   PUT /api/education/:id
// @access  Private
export const updateEducation = async (req, res) => {
  try {
    const { degree, specialization, instituteName, location, status, completionYear, expectedCompletionYear, grade } = req.body;
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    // Validate status-specific fields
    if (status === 'Completed' && !completionYear) {
      return res.status(400).json({ message: 'Completion year is required for completed education' });
    }

    if (status === 'Pursuing' && !expectedCompletionYear) {
      return res.status(400).json({ message: 'Expected completion year is required for pursuing education' });
    }

    // Handle logo update if provided
    if (req.file) {
      // Delete old logo from Cloudinary
      if (education.logoPublicId) {
        await cloudinary.uploader.destroy(education.logoPublicId);
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/education',
            transformation: [
              { width: 1280, height: 720, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      education.logo = result.secure_url;
      education.logoPublicId = result.public_id;
    }

    // Update fields
    education.degree = degree?.trim() || education.degree;
    education.specialization = specialization?.trim() || education.specialization;
    education.instituteName = instituteName?.trim() || education.instituteName;
    education.location = location?.trim() || education.location;
    education.status = status || education.status;
    education.grade = grade?.trim() || education.grade;

    // Update year fields based on status
    if (status === 'Completed') {
      education.completionYear = completionYear;
      education.expectedCompletionYear = undefined;
    } else if (status === 'Pursuing') {
      education.expectedCompletionYear = expectedCompletionYear;
      education.completionYear = undefined;
    }

    await education.save();

    res.json({
      message: 'Education record updated successfully',
      education
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete education record
// @route   DELETE /api/education/:id
// @access  Private
export const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: 'Education record not found' });
    }

    // Delete logo from Cloudinary if exists
    if (education.logoPublicId) {
      await cloudinary.uploader.destroy(education.logoPublicId);
    }

    await education.deleteOne();

    res.json({ message: 'Education record deleted successfully' });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update education order
// @route   PUT /api/education/reorder
// @access  Private
export const reorderEducation = async (req, res) => {
  try {
    const { education } = req.body; // Array of { id, order }

    const updatePromises = education.map(({ id, order }) =>
      Education.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Education records reordered successfully' });
  } catch (error) {
    console.error('Reorder education error:', error);
    res.status(500).json({ message: error.message });
  }
};
