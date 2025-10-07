import Contact from '../models/Contact.js';
import { sendEmail } from '../config/emailConfig.js';
import { adminNotificationTemplate, userConfirmationTemplate } from '../utils/emailTemplates.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, purpose, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !purpose || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Create contact record
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      purpose,
      message: message.trim()
    });

    // Send email notifications
    try {
      // Send notification to admin
      const adminTemplate = adminNotificationTemplate(contact);
      await sendEmail(
        process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        `🚀 New Contact Form Submission from ${contact.name}`,
        adminTemplate.html,
        adminTemplate.text
      );

      // Send confirmation to user
      const userTemplate = userConfirmationTemplate(contact);
      await sendEmail(
        contact.email,
        `Thank you for contacting me, ${contact.name}!`,
        userTemplate.html,
        userTemplate.text
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        purpose: contact.purpose,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit contact form. Please try again.' 
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);
    const unreadCount = await Contact.countDocuments({ isRead: false });

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contact by ID
// @route   GET /api/contact/:id
// @access  Private
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private
export const updateContact = async (req, res) => {
  try {
    const { status, adminNotes, isRead } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update fields
    if (status) contact.status = status;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;
    if (isRead !== undefined) contact.isRead = isRead;

    await contact.save();

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await contact.deleteOne();

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark multiple contacts as read
// @route   PUT /api/contact/mark-read
// @access  Private
export const markMultipleAsRead = async (req, res) => {
  try {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({ message: 'Contact IDs array is required' });
    }

    await Contact.updateMany(
      { _id: { $in: contactIds } },
      { isRead: true }
    );

    res.json({ message: 'Contacts marked as read successfully' });
  } catch (error) {
    console.error('Mark multiple as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private
export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ isRead: false });
    const thisMonth = await Contact.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Purpose distribution
    const purposeStats = await Contact.aggregate([
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          purpose: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Recent contacts (last 7 days daily count)
    const recentStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      total,
      unread,
      thisMonth,
      purposeStats,
      recentStats
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: error.message });
  }
};
