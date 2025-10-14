import Feedback from '../models/Feedback.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get approved testimonials
// @route   GET /api/feedback/testimonials
// @access  Public
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Feedback.find({ isApproved: true })
      .sort({ order: 1, createdAt: -1 });
    
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback/review
// @route   POST /api/feedback
// @access  Public
export const submitFeedback = async (req, res) => {
  try {
    const { fullName, email, rating, feedback, websiteLink } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let profileImage = '';
    let profileImagePublicId = '';

    // Handle profile image upload
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/feedback',
            transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      profileImage = result.secure_url;
      profileImagePublicId = result.public_id;
    }

    const newFeedback = await Feedback.create({
      fullName: fullName.trim(),
      email: email.trim(),
      profileImage,
      profileImagePublicId,
      rating: parseInt(rating),
      feedback: feedback.trim(),
      websiteLink: websiteLink?.trim() || '',
      isApproved: false
    });

    res.status(201).json({
      message: 'Thank you for your feedback! It will be reviewed before being published.',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/feedback/admin
// @access  Private
export const getAllFeedback = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
export const updateFeedback = async (req, res) => {
  try {
    const { fullName, email, rating, feedback, websiteLink, isApproved } = req.body;
    
    const existingFeedback = await Feedback.findById(req.params.id);
    if (!existingFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Handle profile image update
    if (req.file) {
      // Delete old image if exists
      if (existingFeedback.profileImagePublicId) {
        await cloudinary.uploader.destroy(existingFeedback.profileImagePublicId);
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/feedback',
            transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      existingFeedback.profileImage = result.secure_url;
      existingFeedback.profileImagePublicId = result.public_id;
    }

    // Update fields
    if (fullName) existingFeedback.fullName = fullName.trim();
    if (email) existingFeedback.email = email.trim();
    if (rating) existingFeedback.rating = parseInt(rating);
    if (feedback) existingFeedback.feedback = feedback.trim();
    if (websiteLink !== undefined) existingFeedback.websiteLink = websiteLink?.trim() || '';
    if (isApproved !== undefined) existingFeedback.isApproved = isApproved === 'true' || isApproved === true;

    await existingFeedback.save();

    res.json({
      message: 'Feedback updated successfully',
      feedback: existingFeedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Delete image from Cloudinary
    if (feedback.profileImagePublicId) {
      await cloudinary.uploader.destroy(feedback.profileImagePublicId);
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle feedback approval
// @route   PUT /api/feedback/:id/toggle-approval
// @access  Private
export const toggleFeedbackApproval = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.isApproved = !feedback.isApproved;
    await feedback.save();

    res.json({
      message: `Feedback ${feedback.isApproved ? 'approved' : 'unapproved'}`,
      isApproved: feedback.isApproved
    });
  } catch (error) {
    console.error('Toggle feedback approval error:', error);
    res.status(500).json({ message: error.message });
  }
};
