import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminExperience.css';

const AdminExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: 'Job',
    companyName: '',
    role: '',
    employmentType: 'Full-time',
    location: '',
    status: 'Completed',
    startMonth: '',
    startYear: new Date().getFullYear(),
    endMonth: '',
    endYear: new Date().getFullYear(),
    description: '',
    technologies: [],
    skillTags: [],
    companyLink: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSkillTag, setNewSkillTag] = useState('');

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
    fetchExperiences();
    fetchSkills();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/experiences`);
      // Sort to show newest first (by creation date, then by start date)
      const sortedExperiences = response.data.sort((a, b) => {
        // First sort by creation date (newest first)
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (dateB - dateA !== 0) return dateB - dateA;
        
        // Then by start year and month (newest first)
        if (b.startYear !== a.startYear) return b.startYear - a.startYear;
        
        const monthOrder = {
          'January': 1, 'February': 2, 'March': 3, 'April': 4,
          'May': 5, 'June': 6, 'July': 7, 'August': 8,
          'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        return (monthOrder[b.startMonth] || 0) - (monthOrder[a.startMonth] || 0);
      });
      setExperiences(sortedExperiences);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      showError('Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/skills`);
      // Extract all skills from categories
      const allSkills = [];
      response.data.forEach(category => {
        if (category.skills && category.skills.length > 0) {
          allSkills.push(...category.skills);
        }
      });
      setSkills(allSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      showError('Failed to fetch skills');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Job',
      companyName: '',
      role: '',
      employmentType: 'Full-time',
      location: '',
      status: 'Completed',
      startMonth: '',
      startYear: new Date().getFullYear(),
      endMonth: '',
      endYear: new Date().getFullYear(),
      description: '',
      technologies: [],
      skillTags: [],
      companyLink: ''
    });
    setCompanyLogo(null);
    setEditingId(null);
    setShowForm(false);
    setNewSkillTag('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechnologyToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(skillId)
        ? prev.technologies.filter(id => id !== skillId)
        : [...prev.technologies, skillId]
    }));
  };

  const handleFileChange = (e) => {
    setCompanyLogo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'technologies' || key === 'skillTags') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add file if present
      if (companyLogo) {
        submitData.append('companyLogo', companyLogo);
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/experiences/${editingId}`, submitData, config);
        showSuccess('Experience updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/experiences`, submitData, config);
        showSuccess('Experience added successfully');
      }

      fetchExperiences();
      resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
      showError(error.response?.data?.message || 'Failed to save experience');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (experience) => {
    setFormData({
      category: experience.category,
      companyName: experience.companyName,
      role: experience.role,
      employmentType: experience.employmentType,
      location: experience.location,
      status: experience.status,
      startMonth: experience.startMonth,
      startYear: experience.startYear,
      endMonth: experience.endMonth || '',
      endYear: experience.endYear || new Date().getFullYear(),
      description: experience.description,
      technologies: experience.technologies.map(tech => tech._id),
      skillTags: experience.skillTags || [],
      companyLink: experience.companyLink || ''
    });
    setEditingId(experience._id);
    setShowForm(true);
  };

  const addSkillTag = () => {
    if (newSkillTag.trim() && !formData.skillTags.includes(newSkillTag.trim())) {
      setFormData(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, newSkillTag.trim()]
      }));
      setNewSkillTag('');
    }
  };

  const removeSkillTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkillTag();
    }
  };

  const handleDelete = (experience) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Experience',
      message: `Are you sure you want to delete the experience "${experience.role}" at ${experience.companyName}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(experience._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/experiences/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Experience deleted successfully');
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      showError('Failed to delete experience');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const uploadDocument = async (experienceId, file, type) => {
    try {
      const formData = new FormData();
      formData.append(type === 'offer' ? 'offerLetter' : 'completionCertificate', file);

      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/experiences/${experienceId}/${type === 'offer' ? 'offer-letter' : 'completion-certificate'}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      showSuccess(`${type === 'offer' ? 'Offer letter' : 'Completion certificate'} uploaded successfully`);
      fetchExperiences();
    } catch (error) {
      console.error('Error uploading document:', error);
      showError(`Failed to upload ${type === 'offer' ? 'offer letter' : 'completion certificate'}`);
    }
  };

  const deleteDocument = (experienceId, type) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${type === 'offer' ? 'Offer Letter' : 'Completion Certificate'}`,
      message: `Are you sure you want to delete this ${type === 'offer' ? 'offer letter' : 'completion certificate'}? This action cannot be undone.`,
      onConfirm: () => confirmDeleteDocument(experienceId, type),
      type: 'danger'
    });
  };

  const confirmDeleteDocument = async (experienceId, type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/experiences/${experienceId}/${type === 'offer' ? 'offer-letter' : 'completion-certificate'}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      showSuccess(`${type === 'offer' ? 'Offer letter' : 'Completion certificate'} deleted successfully`);
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting document:', error);
      showError(`Failed to delete ${type === 'offer' ? 'offer letter' : 'completion certificate'}`);
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  if (loading) {
    return (
      <div className="admin-experience">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-experience">
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
        <h1>Experience Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Experience
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !uploading && resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Experience' : 'Add New Experience'}</h2>
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

            <form onSubmit={handleSubmit} className="experience-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Job">Job</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role/Position *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Employment Type *</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Month *</label>
                  <select
                    name="startMonth"
                    value={formData.startMonth}
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
                  <label>Start Year *</label>
                  <select
                    name="startYear"
                    value={formData.startYear}
                    onChange={handleInputChange}
                    required
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {formData.status === 'Completed' && (
                  <>
                    <div className="form-group">
                      <label>End Month</label>
                      <select
                        name="endMonth"
                        value={formData.endMonth}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Month</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>End Year</label>
                      <select
                        name="endYear"
                        value={formData.endYear}
                        onChange={handleInputChange}
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Company Link</label>
                  <input
                    type="url"
                    name="companyLink"
                    value={formData.companyLink}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                  />
                </div>

                <div className="form-group">
                  <label>Company Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Describe your key responsibilities and achievements..."
                />
              </div>

              <div className="form-group full-width">
                <label>Technologies Used</label>
                <div className="skills-grid">
                  {skills.map(skill => (
                    <label key={skill._id} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.technologies.includes(skill._id)}
                        onChange={() => handleTechnologyToggle(skill._id)}
                      />
                      <span className="skill-items">
                        <img src={skill.image} alt={skill.name} />
                        {skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Skills & Keywords (Tags)</label>
                <div className="skill-tags-container">
                  <div className="skill-tags-input">
                    <input
                      type="text"
                      value={newSkillTag}
                      onChange={(e) => setNewSkillTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add skill tags (e.g., React, Node.js, API Development)"
                    />
                    <button
                      type="button"
                      onClick={addSkillTag}
                      className="add-tag-btn"
                      disabled={!newSkillTag.trim()}
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.skillTags.length > 0 && (
                    <div className="skill-tags-list">
                      {formData.skillTags.map((tag, index) => (
                        <span key={index} className="skill-tag">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeSkillTag(tag)}
                            className="remove-tag-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="form-hint">
                    Add relevant skills, technologies, and keywords that describe your experience
                  </p>
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
                  {uploading ? 'Saving...' : (editingId ? 'Update Experience' : 'Add Experience')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="experiences-list">
        {experiences.length === 0 ? (
          <div className="no-experiences">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <p>No experiences added yet</p>
            <button className="add-first-btn" onClick={() => setShowForm(true)}>
              Add First Experience
            </button>
          </div>
        ) : (
          experiences.map(experience => (
            <div key={experience._id} className="experience-item">
              <div className="experience-info">
                <div className="experience-header-admin">
                  <div className="experience-main">
                    {experience.companyLogo && (
                      <img src={experience.companyLogo} alt={experience.companyName} className="company-logo-small" />
                    )}
                    <div>
                      <h3>{experience.role}</h3>
                      <p className="company-name">{experience.companyName} • {experience.location}</p>
                      <div className="experience-meta-admin">
                        <span className={`status-badge ${experience.status.toLowerCase()}`}>
                          {experience.status}
                        </span>
                        <span className="category-badge">{experience.category}</span>
                        <span className="duration-badge">
                          {experience.startMonth} {experience.startYear} - {experience.status === 'Ongoing' ? 'Present' : `${experience.endMonth} ${experience.endYear}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="experience-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(experience)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(experience)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="experience-details">
                  <p className="description">{experience.description}</p>
                  
                  {experience.technologies && experience.technologies.length > 0 && (
                    <div className="technologies">
                      <strong>Technologies:</strong>
                      <div className="tech-list">
                        {experience.technologies.map(tech => (
                          <span key={tech._id} className="tech-badge">
                            <img src={tech.image} alt={tech.name} />
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {experience.skillTags && experience.skillTags.length > 0 && (
                    <div className="skill-tags-display">
                      <strong>Skills & Keywords:</strong>
                      <div className="skill-tags-list">
                        {experience.skillTags.map((tag, index) => (
                          <span key={index} className="skill-tag-display">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="document-uploads">
                    <div className="upload-section">
                      <label>Offer Letter:</label>
                      {experience.offerLetter ? (
                        <div className="document-controls">
                          <a href={experience.offerLetter} target="_blank" rel="noopener noreferrer" className="document-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            View Offer Letter
                          </a>
                          <div className="document-actions">
                            <label className="update-document-btn" title="Update offer letter">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => e.target.files[0] && uploadDocument(experience._id, e.target.files[0], 'offer')}
                                style={{ display: 'none' }}
                              />
                            </label>
                            <button
                              className="delete-document-btn"
                              onClick={() => deleteDocument(experience._id, 'offer')}
                              title="Delete offer letter"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => e.target.files[0] && uploadDocument(experience._id, e.target.files[0], 'offer')}
                        />
                      )}
                    </div>

                    {experience.status === 'Completed' && (
                      <div className="upload-section">
                        <label>Completion Certificate:</label>
                        {experience.completionCertificate ? (
                          <div className="document-controls">
                            <a href={experience.completionCertificate} target="_blank" rel="noopener noreferrer" className="document-link">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="7"/>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                              </svg>
                              View Certificate
                            </a>
                            <div className="document-actions">
                              <label className="update-document-btn" title="Update completion certificate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => e.target.files[0] && uploadDocument(experience._id, e.target.files[0], 'certificate')}
                                  style={{ display: 'none' }}
                                />
                              </label>
                              <button
                                className="delete-document-btn"
                                onClick={() => deleteDocument(experience._id, 'certificate')}
                                title="Delete completion certificate"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => e.target.files[0] && uploadDocument(experience._id, e.target.files[0], 'certificate')}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminExperience;
