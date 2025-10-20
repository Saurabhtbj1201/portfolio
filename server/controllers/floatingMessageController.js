import FloatingMessage from '../models/FloatingMessage.js';

// Get active floating message for frontend
export const getFloatingMessage = async (req, res) => {
  try {
    const message = await FloatingMessage.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!message) {
      return res.status(200).json({ message: null });
    }

    res.status(200).json({ 
      message: message.message,
      highlightText: message.highlightText || ''
    });
  } catch (error) {
    console.error('Error fetching floating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all floating messages for admin
export const getAllFloatingMessages = async (req, res) => {
  try {
    const messages = await FloatingMessage.find().sort({ updatedAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching all floating messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new floating message
export const createFloatingMessage = async (req, res) => {
  try {
    const { message, highlightText = '', isActive = true } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 200) {
      return res.status(400).json({ message: 'Message must be less than 200 characters' });
    }

    // If setting this message as active, deactivate all others
    if (isActive) {
      await FloatingMessage.updateMany({}, { isActive: false });
    }

    const newMessage = new FloatingMessage({
      message: message.trim(),
      highlightText: highlightText.trim(),
      isActive
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating floating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update floating message
export const updateFloatingMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, highlightText = '', isActive } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.length > 200) {
      return res.status(400).json({ message: 'Message must be less than 200 characters' });
    }

    // If setting this message as active, deactivate all others
    if (isActive) {
      await FloatingMessage.updateMany({}, { isActive: false });
    }

    const updatedMessage = await FloatingMessage.findByIdAndUpdate(
      id,
      { 
        message: message.trim(),
        highlightText: highlightText.trim(),
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Floating message not found' });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Error updating floating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete floating message
export const deleteFloatingMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await FloatingMessage.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Floating message not found' });
    }

    res.status(200).json({ message: 'Floating message deleted successfully' });
  } catch (error) {
    console.error('Error deleting floating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle active status
export const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await FloatingMessage.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Floating message not found' });
    }

    // If activating this message, deactivate all others
    if (!message.isActive) {
      await FloatingMessage.updateMany({}, { isActive: false });
    }

    message.isActive = !message.isActive;
    message.updatedAt = Date.now();
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
