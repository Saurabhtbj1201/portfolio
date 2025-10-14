import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminContact.css';

const ContactAdmin = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedback, setFeedback] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [messageFilter, setMessageFilter] = useState('all');
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    } else {
      fetchContactMessages();
    }
  }, [activeTab, feedbackFilter, messageFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/feedback/admin`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        params: { status: feedbackFilter !== 'all' ? feedbackFilter : undefined }
      });
      setFeedback(response.data);
    } catch (error) {
      showError('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contact-messages/admin`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        params: { status: messageFilter !== 'all' ? messageFilter : undefined }
      });
      setContactMessages(response.data);
    } catch (error) {
      showError('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (feedbackId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/feedback/${feedbackId}/toggle-approval`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess(response.data.message);
      fetchFeedback();
    } catch (error) {
      showError('Failed to update approval status');
    }
  };

  const handleDeleteFeedback = (feedback) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Feedback',
      message: `Are you sure you want to delete the feedback from "${feedback.fullName}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteFeedback(feedback._id),
      type: 'danger'
    });
  };

  const confirmDeleteFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/feedback/${feedbackId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Feedback deleted successfully');
      fetchFeedback();
    } catch (error) {
      showError('Failed to delete feedback');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback({
      ...feedback,
      profileImage: null // Don't include the existing image in form
    });
    setShowEditModal(true);
  };

  const handleUpdateFeedback = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      Object.keys(editingFeedback).forEach(key => {
        if (key === 'profileImage' && editingFeedback[key]) {
          formData.append(key, editingFeedback[key]);
        } else if (key !== 'profileImage' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          formData.append(key, editingFeedback[key]);
        }
      });

      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/feedback/${editingFeedback._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showSuccess('Feedback updated successfully');
      setShowEditModal(false);
      setEditingFeedback(null);
      fetchFeedback();
    } catch (error) {
      showError('Failed to update feedback');
    }
  };

  const handleDeleteMessage = (message) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Message',
      message: `Are you sure you want to delete the message from "${message.fullName}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteMessage(message._id),
      type: 'danger'
    });
  };

  const confirmDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/contact-messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSuccess('Message deleted successfully');
      fetchContactMessages();
    } catch (error) {
      showError('Failed to delete message');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/contact-messages/${messageId}/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      fetchContactMessages();
    } catch (error) {
      showError('Failed to mark as read');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-contact-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      <div className="page-header">
        <h1>Contact Management</h1>
        <p className="page-subtitle">Manage feedback, reviews, and contact messages</p>
      </div>

      <div className="contact-tabs">
        <button 
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Feedback & Reviews ({feedback.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Get In Touch ({contactMessages.length})
        </button>
      </div>

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="tab-content">
          <div className="filter-bar">
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Feedback</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <h3>No feedback found</h3>
              <p>No feedback matches your current filter</p>
            </div>
          ) : (
            <div className="feedback-grid">
              {feedback.map((item) => (
                <div key={item._id} className={`feedback-card ${!item.isApproved ? 'pending' : ''}`}>
                  <div className="feedback-header">
                    <div className="feedback-user">
                      <div className="user-avatar">
                        {item.profileImage ? (
                          <img src={item.profileImage} alt={item.fullName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h4>{item.fullName}</h4>
                        <p>{item.email}</p>
                        <div className="rating">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="feedback-actions">
                      <button
                        onClick={() => handleToggleApproval(item._id)}
                        className={`approval-btn ${item.isApproved ? 'approved' : 'pending'}`}
                        title={item.isApproved ? 'Remove approval' : 'Approve feedback'}
                      >
                        {item.isApproved ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEditFeedback(item)}
                        className="edit-btn"
                        title="Edit feedback"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteFeedback(item)}
                        className="delete-btn"
                        title="Delete feedback"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="feedback-content">
                    <p className="feedback-text">"{item.feedback}"</p>
                    
                    {item.websiteLink && (
                      <a 
                        href={item.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Visit Website
                      </a>
                    )}
                    
                    <div className="feedback-meta">
                      <span className="date">{formatDate(item.createdAt)}</span>
                      <span className={`status ${item.isApproved ? 'approved' : 'pending'}`}>
                        {item.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Messages Tab */}
      {activeTab === 'messages' && (
        <div className="tab-content">
          <div className="filter-bar">
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : contactMessages.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <h3>No messages found</h3>
              <p>No messages match your current filter</p>
            </div>
          ) : (
            <div className="messages-grid">
              {contactMessages.map((message) => (
                <div 
                  key={message._id} 
                  className={`message-card ${!message.isRead ? 'unread' : ''}`}
                  onClick={() => !message.isRead && markAsRead(message._id)}
                >
                  <div className="message-header">
                    <div className="message-user">
                      <div className="user-avatar">
                        {message.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h4>{message.fullName}</h4>
                        <p>{message.email}</p>
                        <p>{message.phone}</p>
                      </div>
                    </div>
                    
                    <div className="message-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message);
                        }}
                        className="delete-btn"
                        title="Delete message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="message-content">
                    <div className="reason-badge">
                      <span className={`reason ${message.reason.replace(' ', '-')}`}>
                        {message.reason}
                      </span>
                    </div>
                    
                    <p className="message-text">{message.message}</p>
                    
                    <div className="message-meta">
                      <span className="date">{formatDate(message.createdAt)}</span>
                      {!message.isRead && <span className="unread-indicator">New</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Feedback Modal */}
      {showEditModal && editingFeedback && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Feedback</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateFeedback} className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingFeedback.fullName}
                    onChange={(e) => setEditingFeedback({...editingFeedback, fullName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingFeedback.email}
                    onChange={(e) => setEditingFeedback({...editingFeedback, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={editingFeedback.rating}
                    onChange={(e) => setEditingFeedback({...editingFeedback, rating: parseInt(e.target.value)})}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Website Link</label>
                  <input
                    type="url"
                    value={editingFeedback.websiteLink}
                    onChange={(e) => setEditingFeedback({...editingFeedback, websiteLink: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Update Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingFeedback({...editingFeedback, profileImage: e.target.files[0]})}
                />
              </div>

              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  value={editingFeedback.feedback}
                  onChange={(e) => setEditingFeedback({...editingFeedback, feedback: e.target.value})}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingFeedback.isApproved}
                    onChange={(e) => setEditingFeedback({...editingFeedback, isApproved: e.target.checked})}
                  />
                  Approved for display
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Update Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactAdmin;
