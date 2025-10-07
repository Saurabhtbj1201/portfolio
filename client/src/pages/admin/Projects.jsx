import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminProjects.css';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    status: 'Ongoing',
    completionMonth: '',
    completionYear: '',
    skills: [],
    links: [],
    showOnHome: false,
    image: null
  });
  const [editingId, setEditingId] = useState(null);

  // Link types with icons
  const linkTypes = [
    { value: 'Live', label: 'Live Demo', icon: '🌐' },
    { value: 'GitHub', label: 'GitHub', icon: '💻' },
    { value: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
    { value: 'YouTube', label: 'YouTube', icon: '📺' },
    { value: 'Twitter', label: 'Twitter', icon: '🐦' },
    { value: 'Medium', label: 'Medium', icon: '📝' },
    { value: 'Product Hunt', label: 'Product Hunt', icon: '🚀' },
    { value: 'Custom', label: 'Custom Link', icon: '🔗' }
  ];

  // Months for completion
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchProjects();
    fetchSkills();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      showError('Failed to fetch projects');
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/skills`);
      // Flatten skills from categories
      const allSkills = response.data.reduce((acc, category) => {
        return [...acc, ...category.skills];
      }, []);
      setSkills(allSkills);
    } catch (error) {
      showError('Failed to fetch skills');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      showError('Title and description are required');
      return;
    }

    if (!editingId && !formData.image) {
      showError('Project image is required');
      return;
    }

    if (formData.status === 'Completed' && (!formData.completionMonth || !formData.completionYear)) {
      showError('Completion month and year are required for completed projects');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('detailedDescription', formData.detailedDescription.trim());
      submitData.append('status', formData.status);
      submitData.append('showOnHome', formData.showOnHome);

      if (formData.status === 'Completed') {
        submitData.append('completionMonth', formData.completionMonth);
        submitData.append('completionYear', formData.completionYear);
      }

      if (formData.skills.length > 0) {
        formData.skills.forEach(skillId => {
          submitData.append('skills', skillId);
        });
      }

      if (formData.links.length > 0) {
        submitData.append('links', JSON.stringify(formData.links));
      }

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/projects/${editingId}`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        showSuccess('Project updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/projects`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        showSuccess('Project created successfully');
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      detailedDescription: project.detailedDescription || '',
      status: project.status,
      completionMonth: project.completionMonth || '',
      completionYear: project.completionYear || '',
      skills: project.skills.map(skill => skill._id),
      links: project.links || [],
      showOnHome: project.showOnHome,
      image: null
    });
    
    // Scroll to form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (project) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(project._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/projects/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const toggleHomeVisibility = async (project) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/projects/${project._id}/toggle-home`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess(`Project ${project.showOnHome ? 'removed from' : 'added to'} home page`);
      fetchProjects();
    } catch (error) {
      showError('Failed to update home visibility');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      detailedDescription: '',
      status: 'Ongoing',
      completionMonth: '',
      completionYear: '',
      skills: [],
      links: [],
      showOnHome: false,
      image: null
    });
    setEditingId(null);
    
    // Reset file input
    const fileInput = document.getElementById('project-image');
    if (fileInput) fileInput.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { type: 'Live', url: '', customName: '' }]
    }));
  };

  const updateLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const getLinkIcon = (type) => {
    const linkType = linkTypes.find(lt => lt.value === type);
    return linkType ? linkType.icon : '🔗';
  };

  return (
    <div className="admin-projects-page">
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
        <h1>Projects Management</h1>
        <p className="page-subtitle">Manage your portfolio projects</p>
      </div>

      <div className="projects-content">
        {/* Project Form */}
        <div className="form-section" id="project-form">
          <div className="form-card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              {editingId ? 'Edit Project' : 'Add Project'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Project Title <span className="required">*</span></label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., E-commerce Website"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status <span className="required">*</span></label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="form-select"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description <span className="required">*</span></label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the project"
                  required
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="detailedDescription">Detailed Description</label>
                <textarea
                  id="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  placeholder="Detailed project description, features, technologies used, etc."
                  rows="5"
                  className="form-textarea detailed"
                />
              </div>

              {formData.status === 'Completed' && (
                <div className="completion-fields">
                  <div className="form-group">
                    <label htmlFor="completionMonth">Completion Month <span className="required">*</span></label>
                    <select
                      id="completionMonth"
                      value={formData.completionMonth}
                      onChange={(e) => setFormData({ ...formData, completionMonth: e.target.value })}
                      required
                      className="form-select"
                    >
                      <option value="">Select Month</option>
                      {months.map((month) => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="completionYear">Completion Year <span className="required">*</span></label>
                    <input
                      id="completionYear"
                      type="number"
                      value={formData.completionYear}
                      onChange={(e) => setFormData({ ...formData, completionYear: e.target.value })}
                      placeholder="e.g., 2024"
                      min="2000"
                      max={new Date().getFullYear()}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group full-width">
                <label htmlFor="project-image">
                  Project Image {!editingId && <span className="required">*</span>}
                </label>
                <input
                  id="project-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                />
                <p className="form-hint">Recommended: 1200x675px (16:9 ratio), Max 5MB</p>
              </div>

              {/* Skills Selection */}
              <div className="form-group full-width">
                <label>Skills Used</label>
                <div className="skills-selector">
                  {skills.map((skill) => (
                    <div
                      key={skill._id}
                      className={`skill-option ${formData.skills.includes(skill._id) ? 'selected' : ''}`}
                      onClick={() => handleSkillToggle(skill._id)}
                    >
                      <img src={skill.image} alt={skill.name} />
                      <span>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links Section */}
              <div className="form-group full-width">
                <div className="links-section">
                  <div className="links-header">
                    <h3 className="links-title">Project Links</h3>
                    <button type="button" onClick={addLink} className="add-link-btn">
                      + Add Link
                    </button>
                  </div>
                  
                  <div className="links-list">
                    {formData.links.map((link, index) => (
                      <div key={index} className="link-item">
                        <select
                          value={link.type}
                          onChange={(e) => updateLink(index, 'type', e.target.value)}
                          className="link-type-select"
                        >
                          {linkTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                          {link.type === 'Custom' && (
                            <input
                              type="text"
                              value={link.customName}
                              onChange={(e) => updateLink(index, 'customName', e.target.value)}
                              placeholder="Custom link name"
                              className="custom-name-input"
                            />
                          )}
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="link-url-input"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="remove-link-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Show on Home */}
              <div className="form-group full-width">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="showOnHome"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                  />
                  <label htmlFor="showOnHome" className="checkbox-label">
                    Display on Home Page
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Projects List */}
        <div className="list-section">
          <div className="list-card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Projects ({projects.length})
            </h2>
            
            <div className="projects-list">
              {projects.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <p>No projects found</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project._id} className="project-card">
                    <div className="project-card-header">
                      <img src={project.image} alt={project.title} className="project-image" />
                      <div className="project-overlay">
                        <span className={`project-status ${project.status.toLowerCase()}`}>
                          {project.status}
                        </span>
                        <div className="project-actions">
                          <button
                            onClick={() => toggleHomeVisibility(project)}
                            className={`project-action-btn home-toggle-btn ${project.showOnHome ? 'active' : ''}`}
                            title={project.showOnHome ? 'Remove from home' : 'Add to home'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                              <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(project)}
                            className="project-action-btn btn-edit"
                            title="Edit project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            className="project-action-btn btn-deletes"
                            title="Delete project"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="project-card-content">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-description">{project.description}</p>

                      <div className="project-meta">
                        {project.status === 'Completed' && project.completionMonth && project.completionYear && (
                          <span className="project-completion">
                            {project.completionMonth} {project.completionYear}
                          </span>
                        )}
                        {project.showOnHome && (
                          <span className="home-indicator">On Home</span>
                        )}
                      </div>

                      {project.skills.length > 0 && (
                        <div className="project-skills">
                          {project.skills.map((skill) => (
                            <span key={skill._id} className="skill-badge">
                              <img src={skill.image} alt={skill.name} />
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {project.links.length > 0 && (
                        <div className="project-links">
                          {project.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-link"
                            >
                              {getLinkIcon(link.type)}
                              {link.type === 'Custom' ? link.customName : link.type}
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
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
