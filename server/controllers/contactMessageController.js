import ContactMessage from '../models/ContactMessage.js';

// @desc    Submit contact message
// @route   POST /api/contact-messages
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { fullName, email, phone, reason, message } = req.body;

    const newMessage = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      reason,
      message: message.trim()
    });

    res.status(201).json({
      message: 'Thank you for reaching out! We will get back to you soon.',
      contactMessage: newMessage
    });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact-messages/admin
// @access  Private
export const getAllContactMessages = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status === 'read') {
      query.isRead = true;
    } else if (status === 'unread') {
      query.isRead = false;
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Get all contact messages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact-messages/:id/read
// @access  Private
export const markMessageAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({
      message: 'Message marked as read',
      contactMessage: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact-messages/:id
// @access  Private
export const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await ContactMessage.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contact messages stats
// @route   GET /api/contact-messages/stats
// @access  Private
export const getContactStats = async (req, res) => {
  try {
    const total = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ isRead: false });
    
    // Get this month's messages
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await ContactMessage.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      total,
      unread,
      thisMonth
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: error.message });
  }
};
