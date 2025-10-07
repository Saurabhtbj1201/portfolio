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
    resume: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

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
    }
  }, [activeTab]);

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
        resume: response.data.resume || ''
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
          <div className="profile-card">
            <h2>Profile Information</h2>
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
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-card">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
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
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
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
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
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
            <div className="form-group">
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
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({...aboutData, title: e.target.value})}
                  placeholder="e.g., Full Stack Developer"
                  className="form-input"
                />
              </div>

              <div className="form-group">
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

              <div className="form-group">
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
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={aboutData.email}
                    onChange={(e) => setAboutData({...aboutData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
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
      </div>
    </div>
  );
};

export default Profile;
