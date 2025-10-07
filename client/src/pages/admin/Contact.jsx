import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminContact.css';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    thisMonth: 0
  });

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
    fetchContacts();
    fetchStats();
  }, [filter, search]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contact`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { status: filter, search }
      });
      setContacts(response.data.contacts);
    } catch (error) {
      showError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contact/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleContactClick = async (contact) => {
    setSelectedContact(contact);
    
    // Mark as read if not already read
    if (!contact.isRead) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `${import.meta.env.VITE_API_URL}/contact/${contact._id}`,
          { isRead: true },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Update local state
        setContacts(contacts.map(c => 
          c._id === contact._id ? { ...c, isRead: true } : c
        ));
        
        // Update stats
        setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (contactId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/contact/${contactId}`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Status updated successfully');
      fetchContacts();
      
      // Update selected contact if it's the same one
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleDelete = (contact) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Contact',
      message: `Are you sure you want to delete the message from "${contact.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(contact._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/contact/${contactId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Contact deleted successfully');
      fetchContacts();
      fetchStats();
      
      // Close detail view if deleted contact was selected
      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact(null);
      }
    } catch (error) {
      showError('Failed to delete contact');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      hire: 'Hire Me',
      project: 'Project Collaboration',
      connect: 'General Connection',
      other: 'Other'
    };
    return labels[purpose] || purpose;
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

  if (loading) {
    return (
      <div className="admin-contact-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contact-page">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Confirmation Dialog */}
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
        <p className="page-subtitle">Manage contact form submissions and inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Contacts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon unread">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.unread}</h3>
            <p>Unread Messages</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon month">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.thisMonth}</h3>
            <p>This Month</p>
          </div>
        </div>
      </div>

      <div className="contact-content">
        {/* Contact List */}
        <div className="contact-list-section">
          {/* Filters and Search */}
          <div className="contact-filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-tab ${filter === 'new' ? 'active' : ''}`}
                onClick={() => setFilter('new')}
              >
                New
              </button>
              <button 
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                Read
              </button>
              <button 
                className={`filter-tab ${filter === 'replied' ? 'active' : ''}`}
                onClick={() => setFilter('replied')}
              >
                Replied
              </button>
            </div>

            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="contact-list">
            {contacts.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <p>No contacts found</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`contact-item ${!contact.isRead ? 'unread' : ''} ${selectedContact?._id === contact._id ? 'selected' : ''}`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="contact-item-header">
                    <h3 className="contact-name">{contact.name}</h3>
                    <span className="contact-time">{formatDate(contact.createdAt)}</span>
                  </div>
                  
                  <div className="contact-item-info">
                    <span className="contact-email">{contact.email}</span>
                    <span className={`purpose-badge ${contact.purpose}`}>
                      {getPurposeLabel(contact.purpose)}
                    </span>
                  </div>
                  
                  <p className="contact-preview">
                    {contact.message.substring(0, 100)}
                    {contact.message.length > 100 ? '...' : ''}
                  </p>
                  
                  <div className="contact-item-footer">
                    <span className={`status-indicator ${contact.status}`}>
                      {contact.status}
                    </span>
                    {!contact.isRead && <span className="unread-dot"></span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Detail */}
        <div className="contact-detail-section">
          {selectedContact ? (
            <div className="contact-detail">
              <div className="detail-header">
                <div className="contact-avatar">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div className="contact-basic-info">
                  <h2>{selectedContact.name}</h2>
                  <p>{selectedContact.email}</p>
                  <p>{selectedContact.phone}</p>
                </div>
                <div className="contact-actions">
                  <select
                    value={selectedContact.status}
                    onChange={(e) => handleUpdateStatus(selectedContact._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <button
                    onClick={() => handleDelete(selectedContact)}
                    className="btn-delete"
                    title="Delete contact"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="detail-body">
                <div className="detail-section">
                  <h3>Message Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Purpose:</label>
                      <span className={`purpose-badge ${selectedContact.purpose}`}>
                        {getPurposeLabel(selectedContact.purpose)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Submitted:</label>
                      <span>{formatDate(selectedContact.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedContact.status}`}>
                        {selectedContact.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Message</h3>
                  <div className="message-content">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: Your inquiry&body=Hi ${selectedContact.name},%0D%0A%0D%0AThank you for reaching out!%0D%0A%0D%0ABest regards,%0D%0ASaurabh Kumar`}
                      className="action-btn primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Reply via Email
                    </a>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="action-btn secondary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-contact-selected">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <h3>Select a contact</h3>
              <p>Choose a contact from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
