import { useState, useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // New admin state
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Admin list state
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profile image and resume state
  const [profileData, setProfileData] = useState({
    profileImage: '',
    resume: '',
    logo: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // About section state
  const [aboutData, setAboutData] = useState({
    title: '',
    tags: [],
    description: '',
    email: '',
    place: '',
    aboutImage: ''
  });
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);

  // Floating message state
  const [floatingMessage, setFloatingMessage] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    } else if (activeTab === 'uploads') {
      fetchProfileData();
    } else if (activeTab === 'about') {
      fetchProfileData();
    } else if (activeTab === 'profile') {
      fetchProfileData();
    } else if (activeTab === 'message') {
      fetchFloatingMessages();
    }
  }, [activeTab]);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No authentication token found');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Fetch admins error:', error);
      showError(error.response?.data?.message || 'Failed to fetch admins');
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`);
      setProfileData({
        profileImage: response.data.profileImage || '',
        resume: response.data.resume || '',
        logo: response.data.logo || ''
      });
      setAboutData({
        title: response.data.title || '',
        tags: response.data.tags || [],
        description: response.data.description || '',
        email: response.data.email || '',
        place: response.data.place || '',
        aboutImage: response.data.aboutImage || ''
      });
    } catch (error) {
      showError('Failed to fetch profile data');
    }
  };

  const fetchFloatingMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/floating-message/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessageHistory(response.data);
      
      // Set active message in form if exists
      const activeMessage = response.data.find(msg => msg.isActive);
      if (activeMessage) {
        setFloatingMessage(activeMessage.message);
        setHighlightText(activeMessage.highlightText || '');
        setEditingMessageId(activeMessage._id);
      } else {
        setFloatingMessage('');
        setHighlightText('');
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error('Error fetching floating messages:', error);
      showError('Failed to fetch floating messages');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 4) {
      showError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      showSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (newAdmin.password !== newAdmin.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newAdmin.password.length < 4) {
      showError('Password must be at least 4 characters');
      return;
    }

    if (!newAdmin.username.trim() || !newAdmin.email.trim()) {
      showError('Username and email are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No authentication token found');
        setLoading(false);
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          username: newAdmin.username.trim(),
          email: newAdmin.email.trim(),
          password: newAdmin.password
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showSuccess('Admin added successfully');
      setNewAdmin({ username: '', email: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (error) {
      console.error('Add admin error:', error);
      showError(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (adminId, adminUsername) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Administrator',
      message: `Are you sure you want to delete "${adminUsername}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteAdmin(adminId),
      type: 'danger'
    });
  };

  const confirmDeleteAdmin = async (adminId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No authentication token found');
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/auth/admin/${adminId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      showSuccess('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Delete admin error:', error);
      showError(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfileData({ ...profileData, profileImage: response.data.profileImage });
      showSuccess('Profile image uploaded successfully');
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Profile Image',
      message: 'Are you sure you want to delete your profile image? This action cannot be undone.',
      onConfirm: confirmDeleteImage,
      type: 'danger'
    });
  };

  const confirmDeleteImage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/profile/image`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setProfileData({ ...profileData, profileImage: '' });
      showSuccess('Profile image deleted successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete image');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError('Please select a PDF file');
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-resume`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfileData({ ...profileData, resume: response.data.resume });
      showSuccess('Resume uploaded successfully');
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Resume',
      message: 'Are you sure you want to delete your resume? This action cannot be undone.',
      onConfirm: confirmDeleteResume,
      type: 'danger'
    });
  };

  const confirmDeleteResume = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/profile/resume`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setProfileData({ ...profileData, resume: '' });
      showSuccess('Resume deleted successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete resume');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/profile/about`,
        aboutData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showSuccess('About section updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update about section');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = () => {
    const newTag = prompt('Enter new tag:');
    if (newTag && !aboutData.tags.includes(newTag)) {
      setAboutData({
        ...aboutData,
        tags: [...aboutData.tags, newTag]
      });
      showSuccess(`Tag "${newTag}" added successfully`);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setAboutData({
      ...aboutData,
      tags: aboutData.tags.filter(tag => tag !== tagToRemove)
    });
    showSuccess(`Tag "${tagToRemove}" removed successfully`);
  };

  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    setUploadingAboutImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-about-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAboutData({ ...aboutData, aboutImage: response.data.aboutImage });
      showSuccess('About image uploaded successfully');
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload about image');
    } finally {
      setUploadingAboutImage(false);
    }
  };

  const handleDeleteAboutImage = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete About Image',
      message: 'Are you sure you want to delete the about section image? This action cannot be undone.',
      onConfirm: confirmDeleteAboutImage,
      type: 'danger'
    });
  };

  const confirmDeleteAboutImage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/profile/about-image`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setAboutData({ ...aboutData, aboutImage: '' });
      showSuccess('About image deleted successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete about image');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-logo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfileData({ ...profileData, logo: response.data.logo });
      showSuccess('Logo uploaded successfully');
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Logo',
      message: 'Are you sure you want to delete the logo? This action cannot be undone.',
      onConfirm: confirmDeleteLogo,
      type: 'danger'
    });
  };

  const confirmDeleteLogo = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/profile/logo`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setProfileData({ ...profileData, logo: '' });
      showSuccess('Logo deleted successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete logo');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleSaveMessage = async (e) => {
    e.preventDefault();
    
    if (!floatingMessage.trim()) {
      showError('Message is required');
      return;
    }

    if (floatingMessage.length > 200) {
      showError('Message must be less than 200 characters');
      return;
    }

    setLoadingMessage(true);

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const messageData = {
        message: floatingMessage.trim(),
        highlightText: highlightText.trim(),
        isActive: true
      };

      if (editingMessageId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/floating-message/admin/${editingMessageId}`, messageData, config);
        showSuccess('Message updated successfully!');
      } else {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/floating-message/admin`, messageData, config);
        setEditingMessageId(response.data._id);
        showSuccess('Message created successfully!');
      }

      fetchFloatingMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      showError(error.response?.data?.message || 'Failed to save message');
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleDeleteMessage = () => {
    if (!editingMessageId) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Floating Message',
      message: 'Are you sure you want to delete this floating message? This action cannot be undone.',
      onConfirm: confirmDeleteMessage,
      type: 'danger'
    });
  };

  const confirmDeleteMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/floating-message/admin/${editingMessageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFloatingMessage('');
      setHighlightText('');
      setEditingMessageId(null);
      showSuccess('Message deleted successfully!');
      fetchFloatingMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Failed to delete message');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleResetMessage = () => {
    setFloatingMessage('');
    setHighlightText('');
    setEditingMessageId(null);
  };

  const formatMessagePreview = (message, highlight) => {
    if (!highlight || !message.includes(highlight)) {
      return message;
    }
    
    const parts = message.split(highlight);
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <span className="floating-message-highlight-preview">{highlight}</span>
        )}
      </span>
    ));
  };

  return (
    <div className="profile-page">
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

      <div className="profile-header">
        <h1>Admin Profile</h1>
        <p className="profile-subtitle">Manage your account and administrators</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'message' ? 'active' : ''}`}
          onClick={() => setActiveTab('message')}
        >
          Floating Message
        </button>
        <button 
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Section
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          Manage Admins
        </button>
        <button 
          className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          Uploads
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <>
            <div className="profile-card">
              <h2>Profile Information</h2>
              <div className="profile-info-container">
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Username:</span>
                    <span className="info-value">{user?.username}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role:</span>
                    <span className="info-value badge-role">{user?.role}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Created:</span>
                    <span className="info-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* Current Logo Display & Management */}
                <div className="current-logo-display">
                  <h3>Website Logo</h3>
                  {profileData.logo ? (
                    <div className="current-logo-container">
                      <div className="current-logo-preview">
                        <img 
                          src={profileData.logo} 
                          alt="Current Website Logo" 
                          className="current-logo-image" 
                        />
                      </div>
                      <p className="logo-status active">Active</p>
                      <div className="logo-quick-actions">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="upload-input"
                          id="quick-logo-upload"
                        />
                        <label htmlFor="quick-logo-upload" className={`quick-action-btn edit ${uploadingLogo ? 'uploading' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          {uploadingLogo ? 'Updating...' : 'Edit'}
                        </label>
                        <button 
                          onClick={handleDeleteLogo} 
                          className="quick-action-btn delete" 
                          disabled={uploadingLogo}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="no-logo-container">
                      <div className="no-logo-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p>No logo set</p>
                      </div>
                      <p className="logo-status inactive">Inactive</p>
                      <div className="logo-quick-actions">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="upload-input"
                          id="quick-logo-upload-new"
                        />
                        <label htmlFor="quick-logo-upload-new" className={`quick-action-btn upload ${uploadingLogo ? 'uploading' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </label>
                      </div>
                    </div>
                  )}
                  <p className="logo-hint">Displays in header and footer</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-card">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-groupa">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-groupa">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-groupa">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Admins Tab */}
        {activeTab === 'admins' && (
          <>
            <div className="profile-card">
              <h2>Add New Admin</h2>
              <form onSubmit={handleAddAdmin} className="admin-form">
                <div className="form-row">
                  <div className="form-groupa">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-groupa">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-groupa">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-groupa">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={newAdmin.confirmPassword}
                      onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Admin'}
                </button>
              </form>
            </div>

            <div className="profile-card">
              <h2>All Administrators</h2>
              <div className="admin-list">
                {loading && admins.length === 0 ? (
                  <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Loading administrators...</p>
                  </div>
                ) : admins.length === 0 ? (
                  <div className="no-data">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No administrators found</p>
                  </div>
                ) : (
                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{admin.username}</td>
                            <td>{admin.email}</td>
                            <td><span className="badge-role">{admin.role}</span></td>
                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                            <td>
                              {admin._id !== user?._id ? (
                                <button
                                  onClick={() => handleDeleteAdmin(admin._id, admin.username)}
                                  className="btn-delete"
                                >
                                  Delete
                                </button>
                              ) : (
                                <span className="current-user-badge">Current User</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className="profile-card">
            <h2>Profile Image & Resume</h2>
            <div className="upload-section">
              <div className="upload-grid">
                {/* Profile Image Section */}
                <div className="upload-item">
                  <h3>Profile Image</h3>
                  <div className="upload-preview-container">
                    {profileData.profileImage ? (
                      <>
                        <img 
                          src={profileData.profileImage} 
                          alt="Profile" 
                          className="upload-preview" 
                        />
                        <button 
                          onClick={handleDeleteImage} 
                          className="btn-delete-upload" 
                          disabled={uploadingImage}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete Image
                        </button>
                      </>
                    ) : (
                      <div className="upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p>No image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Section */}
                <div className="upload-item">
                  <h3>Resume</h3>
                  <div className="upload-preview-container">
                    {profileData.resume ? (
                      <>
                        <div className="resume-preview">
                          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                          <div className="resume-info">
                            <p className="resume-name">Resume.pdf</p>
                            <a href={profileData.resume} target="_blank" rel="noopener noreferrer" className="resume-link">
                              View Resume
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={handleDeleteResume} 
                          className="btn-delete-upload" 
                          disabled={uploadingResume}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete Resume
                        </button>
                      </>
                    ) : (
                      <div className="upload-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <p>No resume uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Buttons Row */}
              <div className="upload-buttons-row">
                <div className="upload-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="upload-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className={`upload-label ${uploadingImage ? 'uploading' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploadingImage ? 'Uploading...' : 'Upload Profile Image'}
                  </label>
                  <p className="upload-hint">Recommended: 500x500px, Max 5MB (JPG, PNG)</p>
                </div>

                <div className="upload-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="upload-input"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className={`upload-label ${uploadingResume ? 'uploading' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  </label>
                  <p className="upload-hint">Max 10MB (PDF only)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div className="profile-card">
            <h2>About Section Management</h2>
            
            {/* About Image Upload Section */}
            <div className="form-groupa">
              <label>About Image</label>
              <div className="upload-section">
                {aboutData.aboutImage ? (
                  <div className="upload-card">
                    <div className="upload-preview-container">
                      <img 
                        src={aboutData.aboutImage} 
                        alt="About" 
                        className="upload-preview" 
                        style={{ borderRadius: '12px' }}
                      />
                      <button 
                        onClick={handleDeleteAboutImage} 
                        className="btn-delete-upload" 
                        disabled={uploadingAboutImage}
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete About Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <p>No about image uploaded</p>
                  </div>
                )}
                
                <div className="upload-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAboutImageUpload}
                    disabled={uploadingAboutImage}
                    className="upload-input"
                    id="about-image-upload"
                  />
                  <label htmlFor="about-image-upload" className={`upload-label ${uploadingAboutImage ? 'uploading' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploadingAboutImage ? 'Uploading...' : aboutData.aboutImage ? 'Replace About Image' : 'Upload About Image'}
                  </label>
                  <p className="upload-hint">Recommended: 800x1000px, Max 5MB (JPG, PNG)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateAbout} className="admin-form">
              <div className="form-groupa">
                <label>Title</label>
                <input
                  type="text"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({...aboutData, title: e.target.value})}
                  placeholder="e.g., Full Stack Developer"
                  className="form-input"
                />
              </div>

              <div className="form-groupa">
                <label>Tags</label>
                <div className="tags-container">
                  <div className="tags-list">
                    {aboutData.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleTagRemove(tag)}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={handleTagAdd} className="tag-add-btn">
                    + Add Tag
                  </button>
                </div>
              </div>

              <div className="form-groupa">
                <label>Description</label>
                <textarea
                  value={aboutData.description}
                  onChange={(e) => setAboutData({...aboutData, description: e.target.value})}
                  placeholder="Write about yourself..."
                  className="form-input textarea"
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="form-groupa">
                  <label>Email</label>
                  <input
                    type="email"
                    value={aboutData.email}
                    onChange={(e) => setAboutData({...aboutData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-groupa">
                  <label>Location</label>
                  <input
                    type="text"
                    value={aboutData.place}
                    onChange={(e) => setAboutData({...aboutData, place: e.target.value})}
                    placeholder="City, Country"
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update About Section'}
              </button>
            </form>
          </div>
        )}

        {/* Floating Message Tab */}
        {activeTab === 'message' && (
          <div className="profile-card">
            <h2>Floating Message Settings</h2>
            <p className="profile-subtitle" style={{ marginBottom: '2rem' }}>
              Manage the floating message that appears on your homepage. You can add special styling to specific text.
            </p>

            <form onSubmit={handleSaveMessage} className="admin-form">
              <div className="form-groupa">
                <label>
                  Message Text
                  <span style={{ color: '#ef4444', fontWeight: '600', marginLeft: '4px' }}>*</span>
                </label>
                <textarea
                  value={floatingMessage}
                  onChange={(e) => setFloatingMessage(e.target.value)}
                  placeholder="Enter your floating message here..."
                  maxLength="200"
                  rows="3"
                  className="form-input"
                  style={{ minHeight: '90px', resize: 'vertical' }}
                  required
                />
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.8rem', 
                  color: '#64748b', 
                  marginTop: '0.5rem' 
                }}>
                  {floatingMessage.length}/200 characters
                </div>
              </div>

              <div className="form-groupa">
                <label>
                  Highlight Text (Optional)
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '18px', 
                    height: '18px', 
                    background: '#667eea', 
                    color: 'white', 
                    borderRadius: '50%', 
                    fontSize: '0.7rem', 
                    fontWeight: '600', 
                    marginLeft: '8px',
                    cursor: 'help'
                  }} title="Text that will be styled differently within your message">?</span>
                </label>
                <input
                  type="text"
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  placeholder="e.g., 'special offer', 'new project', etc."
                  className="form-input"
                />
                <small style={{ 
                  color: '#64748b', 
                  fontSize: '0.85rem', 
                  lineHeight: '1.4', 
                  marginTop: '0.5rem',
                  display: 'block'
                }}>
                  Enter specific text from your message that you want to highlight with special styling.
                </small>
              </div>

              {floatingMessage && (
                <div className="form-groupa">
                  <label>Preview</label>
                  <div className="floating-message-preview">
                    <div className="preview-bar">
                      <div className="preview-content">
                        <span className="preview-text">
                          {formatMessagePreview(floatingMessage, highlightText)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={handleResetMessage}
                  disabled={loadingMessage}
                  className="btn-secondary"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-color)',
                    border: '2px solid var(--border-color)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Reset
                </button>
                
                {editingMessageId && (
                  <button
                    type="button"
                    onClick={handleDeleteMessage}
                    disabled={loadingMessage}
                    className="btn-delete"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Delete Message
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loadingMessage}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loadingMessage && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {loadingMessage ? (
                    editingMessageId ? 'Updating...' : 'Creating...'
                  ) : (
                    editingMessageId ? 'Update Message' : 'Create Message'
                  )}
                </button>
              </div>
            </form>

            {messageHistory.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: 'var(--text-color)', fontSize: '1.2rem', marginBottom: '1rem' }}>
                  Message History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messageHistory.slice(0, 5).map((msg) => (
                    <div key={msg._id} style={{
                      padding: '1rem',
                      border: `1px solid ${msg.isActive ? '#22c55e' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      background: msg.isActive ? 'rgba(34, 197, 94, 0.05)' : 'var(--input-bg)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-color)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {msg.message}
                        </span>
                        {msg.highlightText && (
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                            marginTop: '0.25rem'
                          }}>
                            Highlight: "{msg.highlightText}"
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: msg.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          color: msg.isActive ? '#22c55e' : '#9ca3af'
                        }}>
                          {msg.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(msg.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
