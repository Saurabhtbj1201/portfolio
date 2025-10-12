import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminAwards.css';

const AdminAwards = () => {
  const [awards, setAwards] = useState([]);
  const [associations, setAssociations] = useState({ experiences: [], education: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    associatedWithType: 'none',
    associatedWithId: '',
    description: '',
    issueMonth: '',
    issueYear: new Date().getFullYear(),
    certificateLink: '',
    featured: false
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'linkedin', url: '' });

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
    fetchAwards();
    fetchAssociations();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/awards`);
      // Sort to show newest first
      const sortedAwards = response.data.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      setAwards(sortedAwards);
    } catch (error) {
      console.error('Error fetching awards:', error);
      showError('Failed to fetch awards');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/awards/data/associations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssociations(response.data);
    } catch (error) {
      console.error('Error fetching associations:', error);
      showError('Failed to fetch associations');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      associatedWithType: 'none',
      associatedWithId: '',
      description: '',
      issueMonth: '',
      issueYear: new Date().getFullYear(),
      certificateLink: '',
      featured: false
    });
    setCertificateFile(null);
    setImageFile(null);
    setSocialLinks([]);
    setEditingId(null);
    setShowForm(false);
    setNewSocialLink({ platform: 'linkedin', url: '' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'certificate') {
      setCertificateFile(file);
    } else if (type === 'image') {
      setImageFile(file);
    }
  };

  const addSocialLink = () => {
    if (newSocialLink.url.trim()) {
      setSocialLinks(prev => [...prev, { ...newSocialLink }]);
      setNewSocialLink({ platform: 'linkedin', url: '' });
    }
  };

  const removeSocialLink = (index) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'associatedWithType') {
          submitData.append(key, formData[key]);
        } else if (key === 'associatedWithId') {
          submitData.append(key, formData[key]);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add social links
      submitData.append('socialLinks', JSON.stringify(socialLinks));

      // Add files if present
      if (certificateFile) {
        submitData.append('certificate', certificateFile);
      }
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/awards/${editingId}`, submitData, config);
        showSuccess('Award updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/awards`, submitData, config);
        showSuccess('Award added successfully');
      }

      fetchAwards();
      resetForm();
    } catch (error) {
      console.error('Error saving award:', error);
      showError(error.response?.data?.message || 'Failed to save award');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (award) => {
    setFormData({
      title: award.title,
      organization: award.organization,
      associatedWithType: award.associatedWith.type,
      associatedWithId: award.associatedWith.type !== 'none' ? award.associatedWith.id._id : '',
      description: award.description,
      issueMonth: award.issueMonth,
      issueYear: award.issueYear,
      certificateLink: award.certificateLink || '',
      featured: award.featured
    });
    setSocialLinks(award.socialLinks || []);
    setEditingId(award._id);
    setShowForm(true);
  };

  const handleDelete = (award) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Award',
      message: `Are you sure you want to delete the award "${award.title}" from ${award.organization}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(award._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/awards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Award deleted successfully');
      fetchAwards();
    } catch (error) {
      console.error('Error deleting award:', error);
      showError('Failed to delete award');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const toggleFeatured = async (awardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/awards/${awardId}/toggle-featured`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess(response.data.message);
      fetchAwards();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showError('Failed to update featured status');
    }
  };

  const getAssociationText = (award) => {
    if (award.associatedWith.type === 'none') {
      return 'Independent Achievement';
    } else if (award.associatedWith.type === 'experience') {
      return `${award.associatedWith.id.role} at ${award.associatedWith.id.companyName}`;
    } else {
      return `${award.associatedWith.id.instituteName}`;
    }
  };

  if (loading) {
    return (
      <div className="admin-awards">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-awards">
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
        <h1>Awards & Achievements</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Award
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !uploading && resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Award' : 'Add New Award'}</h2>
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

            <form onSubmit={handleSubmit} className="award-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Award Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Best Employee of the Year"
                  />
                </div>

                <div className="form-group">
                  <label>Organization/Institution *</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Google, University of California"
                  />
                </div>

                <div className="form-group">
                  <label>Associated With *</label>
                  <select
                    name="associatedWithType"
                    value={formData.associatedWithType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="none">None</option>
                    <option value="experience">Experience</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                {formData.associatedWithType !== 'none' && (
                  <div className="form-group">
                    <label>Select {formData.associatedWithType === 'experience' ? 'Experience' : 'Education'} *</label>
                    <select
                      name="associatedWithId"
                      value={formData.associatedWithId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select {formData.associatedWithType}</option>
                      {formData.associatedWithType === 'experience' 
                        ? associations.experiences.map(exp => (
                            <option key={exp._id} value={exp._id}>
                              {exp.role} at {exp.companyName}
                            </option>
                          ))
                        : associations.education.map(edu => (
                            <option key={edu._id} value={edu._id}>
                              {edu.instituteName} - {edu.degree}
                            </option>
                          ))
                      }
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Issue Month *</label>
                  <select
                    name="issueMonth"
                    value={formData.issueMonth}
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
                  <label>Issue Year *</label>
                  <select
                    name="issueYear"
                    value={formData.issueYear}
                    onChange={handleInputChange}
                    required
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Certificate/Document</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                  />
                </div>

                <div className="form-group">
                  <label>Organization Image/Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                  />
                </div>

                <div className="form-group">
                  <label>Certificate/Reference Link</label>
                  <input
                    type="url"
                    name="certificateLink"
                    value={formData.certificateLink}
                    onChange={handleInputChange}
                    placeholder="https://certificate-link.com"
                  />
                </div>

                <div className="form-group">
                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <label>Mark as Featured</label>
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Brief description of the achievement and its significance..."
                />
              </div>

              <div className="form-group full-width">
                <label>Social Links (LinkedIn Posts, etc.)</label>
                <div className="social-links-container">
                  <div className="social-link-input">
                    <select
                      value={newSocialLink.platform}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                    >
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <input
                      type="url"
                      value={newSocialLink.url}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://linkedin.com/posts/..."
                    />
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="add-social-btn"
                      disabled={!newSocialLink.url.trim()}
                    >
                      Add
                    </button>
                  </div>
                  
                  {socialLinks.length > 0 && (
                    <div className="social-links-list">
                      {socialLinks.map((link, index) => (
                        <div key={index} className="social-link-item">
                          <div className="social-link-info">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <span>{link.platform}: {link.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="remove-social-btn"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
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
                  {uploading ? 'Saving...' : (editingId ? 'Update Award' : 'Add Award')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="awards-list">
        {awards.length === 0 ? (
          <div className="no-awards">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
            <p>No awards added yet</p>
            <button className="add-first-btn" onClick={() => setShowForm(true)}>
              Add First Award
            </button>
          </div>
        ) : (
          awards.map(award => (
            <div key={award._id} className="award-item">
              <div className="award-header-admin">
                <div className="award-main">
                  {award.image ? (
                    <img src={award.image} alt={award.organization} className="award-image-small" />
                  ) : (
                    <div className="award-image-placeholder-small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3>{award.title}</h3>
                    <p className="award-organization-admin">{award.organization}</p>
                    <div className="award-meta-admin">
                      <span className="date-badge">
                        {award.issueMonth} {award.issueYear}
                      </span>
                      {award.featured && (
                        <span className="featured-badge-admin">Featured</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="award-actions">
                  <button 
                    className="toggle-featured-btn"
                    onClick={() => toggleFeatured(award._id)}
                    title={award.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {award.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(award)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(award)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="award-details">
                <p className="award-description-admin">{award.description}</p>
                
                <div className="award-association">
                  <strong>Associated with:</strong>
                  <span className="association-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {getAssociationText(award)}
                  </span>
                </div>

                <div className="award-links-admin">
                  {award.certificate && (
                    <a
                      href={award.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="award-link-admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      View Certificate
                    </a>
                  )}
                  {award.certificateLink && (
                    <a
                      href={award.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="award-link-admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Reference Link
                    </a>
                  )}
                </div>

                {award.socialLinks && award.socialLinks.length > 0 && (
                  <div className="social-links-admin">
                    {award.socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link-admin"
                        title={`View on ${link.platform}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAwards;
