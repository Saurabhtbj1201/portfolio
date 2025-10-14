import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminCertifications.css';

const AdminCertifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    completionMonth: '',
    completionYear: new Date().getFullYear(),
    credentialId: '',
    credentialUrl: '',
    description: '',
    skills: [],
    pinned: false
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showNewOrganization, setShowNewOrganization] = useState(false);

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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/certifications`);
      // Sort to show pinned first, then newest
      const sortedCertifications = response.data.sort((a, b) => {
        // First sort by pinned status (pinned first)
        if (b.pinned !== a.pinned) return b.pinned - a.pinned;
        
        // Then by creation date (newest first)
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      setCertifications(sortedCertifications);
      
      // Extract unique organizations
      const uniqueOrganizations = [];
      const organizationMap = new Map();
      
      sortedCertifications.forEach(cert => {
        if (!organizationMap.has(cert.organization)) {
          organizationMap.set(cert.organization, {
            name: cert.organization,
            image: cert.image,
            count: 1
          });
          uniqueOrganizations.push({
            name: cert.organization,
            image: cert.image,
            count: 1
          });
        } else {
          const existing = organizationMap.get(cert.organization);
          existing.count++;
          // Update image if current cert has image and existing doesn't
          if (cert.image && !existing.image) {
            existing.image = cert.image;
            const orgIndex = uniqueOrganizations.findIndex(org => org.name === cert.organization);
            if (orgIndex !== -1) {
              uniqueOrganizations[orgIndex].image = cert.image;
            }
          }
        }
      });
      
      setOrganizations(uniqueOrganizations);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      showError('Failed to fetch certifications');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      completionMonth: '',
      completionYear: new Date().getFullYear(),
      credentialId: '',
      credentialUrl: '',
      description: '',
      skills: [],
      pinned: false
    });
    setCertificateFile(null);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
    setNewSkill('');
    setSelectedOrganization(null);
    setShowNewOrganization(false);
  };

  const handleOrganizationSelect = (organization) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
      organization: organization.name
    }));
    setShowNewOrganization(false);
    
    // Clear any selected image file since we're using existing organization logo
    setImageFile(null);
    
    // Reset both file inputs if they exist
    const imageInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (imageInput) {
      imageInput.value = '';
    }
    
    const certificateInput = document.querySelector('input[type="file"][accept=".pdf,.jpg,.jpeg,.png"]');
    if (certificateInput) {
      certificateInput.value = '';
    }
  };

  const handleNewOrganization = () => {
    setSelectedOrganization(null);
    setFormData(prev => ({
      ...prev,
      organization: ''
    }));
    setShowNewOrganization(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // If organization input changes manually, clear selected organization
    if (name === 'organization') {
      setSelectedOrganization(null);
      // Also clear any selected image file
      setImageFile(null);
      const imageInput = document.querySelector('input[type="file"][accept="image/*"]');
      if (imageInput) {
        imageInput.value = '';
      }
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'certificate') {
      setCertificateFile(file);
    } else if (type === 'image') {
      setImageFile(file);
      // Clear selected organization when manually selecting a new image
      if (file) {
        setSelectedOrganization(null);
      }
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files if present
      if (certificateFile) {
        submitData.append('certificate', certificateFile);
      }
      
      // Only add image file if user selected a new one
      // If using existing organization and no new image selected, don't send image
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (selectedOrganization && selectedOrganization.image && !editingId) {
        // For new certifications, if using existing organization, we might want to reuse the image
        // This would require backend support to handle organization image reuse
      }

      // Add organization context for backend processing
      if (selectedOrganization && !imageFile) {
        submitData.append('useExistingOrgImage', 'true');
        submitData.append('existingOrgImageUrl', selectedOrganization.image || '');
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/certifications/${editingId}`, submitData, config);
        showSuccess('Certification updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/certifications`, submitData, config);
        showSuccess('Certification added successfully');
      }

      fetchCertifications();
      resetForm();
    } catch (error) {
      console.error('Error saving certification:', error);
      showError(error.response?.data?.message || 'Failed to save certification');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (certification) => {
    setFormData({
      title: certification.title,
      organization: certification.organization,
      completionMonth: certification.completionMonth,
      completionYear: certification.completionYear,
      credentialId: certification.credentialId || '',
      credentialUrl: certification.credentialUrl || '',
      description: certification.description || '',
      skills: certification.skills || [],
      pinned: certification.pinned
    });
    
    // Find and set selected organization
    const existingOrg = organizations.find(org => org.name === certification.organization);
    if (existingOrg) {
      setSelectedOrganization(existingOrg);
      setShowNewOrganization(false);
    } else {
      setSelectedOrganization(null);
      setShowNewOrganization(true);
    }
    
    // Clear file inputs when editing
    setCertificateFile(null);
    setImageFile(null);
    
    setEditingId(certification._id);
    setShowForm(true);
  };

  const handleDelete = (certification) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Certification',
      message: `Are you sure you want to delete the certification "${certification.title}" from ${certification.organization}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(certification._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/certifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Certification deleted successfully');
      fetchCertifications();
    } catch (error) {
      console.error('Error deleting certification:', error);
      showError('Failed to delete certification');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const togglePinned = async (certificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/certifications/${certificationId}/toggle-pinned`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess(response.data.message);
      fetchCertifications();
    } catch (error) {
      console.error('Error toggling pinned status:', error);
      showError('Failed to update pinned status');
    }
  };

  if (loading) {
    return (
      <div className="admin-certifications">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-certifications">
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

      <div className="admin-header">
        <h1>Certifications Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Certification
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !uploading && resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Certification' : 'Add New Certification'}</h2>
              <button 
                className="close-btn"
                onClick={resetForm}
                disabled={uploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="certification-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Course/Certificate Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Full Stack Web Development"
                  />
                </div>

                <div className="form-group">
                  <label>Issuing Organization/Platform *</label>
                  {organizations.length > 0 && !showNewOrganization && (
                    <div className="organization-selection">
                      <p className="organization-selection-label">Select from previous organizations:</p>
                      <div className="organizations-grid">
                        {organizations.map((org, index) => (
                          <div
                            key={index}
                            className={`organization-item ${selectedOrganization?.name === org.name ? 'selected' : ''}`}
                            onClick={() => handleOrganizationSelect(org)}
                          >
                            <div className="organization-image">
                              {org.image ? (
                                <img src={org.image} alt={org.name} />
                              ) : (
                                <div className="organization-placeholder">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="organization-info">
                              <span className="organization-name">{org.name}</span>
                              <span className="organization-count">{org.count} certificate{org.count > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleNewOrganization}
                        className="new-organization-btn"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add New Organization
                      </button>
                    </div>
                  )}
                  
                  {(showNewOrganization || organizations.length === 0) && (
                    <div className="new-organization-form">
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Coursera, Udemy, Google"
                      />
                      {organizations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewOrganization(false);
                            setFormData(prev => ({ ...prev, organization: '' }));
                          }}
                          className="cancel-new-organization-btn"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Completion Month *</label>
                  <select
                    name="completionMonth"
                    value={formData.completionMonth}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Completion Year *</label>
                  <select
                    name="completionYear"
                    value={formData.completionYear}
                    onChange={handleInputChange}
                    required
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Credential ID</label>
                  <input
                    type="text"
                    name="credentialId"
                    value={formData.credentialId}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC123XYZ789"
                  />
                </div>

                <div className="form-group">
                  <label>Credential/Verify URL</label>
                  <input
                    type="url"
                    name="credentialUrl"
                    value={formData.credentialUrl}
                    onChange={handleInputChange}
                    placeholder="https://certificate-verification-link.com"
                  />
                </div>

                <div className="form-group">
                  <label>Certificate File (PDF/Image)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                  />
                </div>

                <div className="form-group">
                  <label>Organization Logo/Image</label>
                  {selectedOrganization && selectedOrganization.image && !imageFile && (
                    <div className="current-logo-preview">
                      <p>Using logo from {selectedOrganization.name}:</p>
                      <img src={selectedOrganization.image} alt={selectedOrganization.name} className="logo-preview" />
                      <p className="logo-note">
                        {editingId 
                          ? "Upload a new image to replace this logo, or leave empty to keep using this organization's logo"
                          : "This logo will be used for this certification. Upload a different image to override."
                        }
                      </p>
                    </div>
                  )}
                  {editingId && !selectedOrganization && (
                    <div className="current-logo-preview">
                      <p className="logo-note">
                        Select a previous organization to reuse its logo, or upload a new image
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    key={selectedOrganization ? `selected-${selectedOrganization.name}` : 'no-selection'}
                  />
                  {imageFile && (
                    <p className="form-hint">
                      New image selected: {imageFile.name} (This will override the organization logo)
                    </p>
                  )}
                  {!imageFile && selectedOrganization && selectedOrganization.image && (
                    <p className="form-hint">
                      Currently using: {selectedOrganization.name}'s logo
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      name="pinned"
                      checked={formData.pinned}
                      onChange={handleInputChange}
                    />
                    <label>Pin Certificate</label>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Brief description of what you learned or achieved..."
                />
              </div>

              <div className="form-group full-width">
                <label>Skills & Technologies Learned</label>
                <div className="skills-container">
                  <div className="skills-input">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add skills (e.g., React, Node.js, MongoDB)"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="add-skill-btn"
                      disabled={!newSkill.trim()}
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="skill-list">
                      {formData.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="remove-skill-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={resetForm}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : (editingId ? 'Update Certification' : 'Add Certification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="certifications-list">
        {certifications.length === 0 ? (
          <div className="no-certifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 15l2 2 4-4"/>
            </svg>
            <p>No certifications added yet</p>
            <button className="add-first-btn" onClick={() => setShowForm(true)}>
              Add First Certification
            </button>
          </div>
        ) : (
          certifications.map(certification => (
            <div key={certification._id} className="certification-item">
              <div className="certification-header-admin">
                <div className="certification-main">
                  {certification.image ? (
                    <img src={certification.image} alt={certification.organization} className="certification-image-small" />
                  ) : (
                    <div className="certification-image-placeholder-small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M9 15l2 2 4-4"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3>{certification.title}</h3>
                    <p className="certification-organization-admin">{certification.organization}</p>
                    <div className="certification-meta-admin">
                      <span className="date-badge">
                        {certification.completionMonth} {certification.completionYear}
                      </span>
                      {certification.pinned && (
                        <span className="pinned-badge-admin">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 17l-5-5h3V4h4v8h3l-5 5z"/>
                          </svg>
                          Pinned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="certification-actions">
                  <button 
                    className="toggle-pinned-btn"
                    onClick={() => togglePinned(certification._id)}
                    title={certification.pinned ? 'Unpin certificate' : 'Pin certificate'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 17l-5-5h3V4h4v8h3l-5 5z"/>
                    </svg>
                    {certification.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(certification)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(certification)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="certification-details">
                {certification.description && (
                  <p className="certification-description-admin">{certification.description}</p>
                )}

                {certification.skills && certification.skills.length > 0 && (
                  <div className="certification-skills-admin">
                    <strong>Skills & Technologies:</strong>
                    <div className="skill-list-admin">
                      {certification.skills.map((skill, index) => (
                        <span key={index} className="skill-tag-admin">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="certification-info-admin">
                  {certification.credentialId && (
                    <div className="info-item">
                      <strong>Credential ID:</strong>
                      <span>{certification.credentialId}</span>
                    </div>
                  )}
                </div>

                <div className="certification-links-admin">
                  {certification.certificate && (
                    <a
                      href={certification.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certification-link-admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      View Certificate
                    </a>
                  )}
                  {certification.credentialUrl && (
                    <a
                      href={certification.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certification-link-admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Verify Credential
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCertifications;
