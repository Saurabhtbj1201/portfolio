import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminEducation.css';

const AdminEducation = () => {
  const [educationData, setEducationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    degree: '',
    specialization: '',
    instituteName: '',
    location: '',
    status: 'Completed',
    completionYear: '',
    expectedCompletionYear: '',
    grade: '',
    logo: null
  });
  const [editingId, setEditingId] = useState(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/education`);
      setEducationData(response.data);
    } catch (error) {
      showError('Failed to fetch education records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.degree.trim() || !formData.instituteName.trim()) {
      showError('Degree and institute name are required');
      return;
    }

    if (formData.status === 'Completed' && !formData.completionYear) {
      showError('Completion year is required for completed education');
      return;
    }

    if (formData.status === 'Pursuing' && !formData.expectedCompletionYear) {
      showError('Expected completion year is required for pursuing education');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('degree', formData.degree.trim());
      submitData.append('specialization', formData.specialization.trim());
      submitData.append('instituteName', formData.instituteName.trim());
      submitData.append('location', formData.location.trim());
      submitData.append('status', formData.status);
      submitData.append('grade', formData.grade.trim());

      if (formData.status === 'Completed') {
        submitData.append('completionYear', formData.completionYear);
      } else {
        submitData.append('expectedCompletionYear', formData.expectedCompletionYear);
      }

      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/education/${editingId}`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        showSuccess('Education record updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/education`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        showSuccess('Education record created successfully');
      }

      resetForm();
      fetchEducation();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save education record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (education) => {
    setEditingId(education._id);
    setFormData({
      degree: education.degree,
      specialization: education.specialization || '',
      instituteName: education.instituteName,
      location: education.location || '',
      status: education.status,
      completionYear: education.completionYear || '',
      expectedCompletionYear: education.expectedCompletionYear || '',
      grade: education.grade || '',
      logo: null
    });
    
    // Scroll to form
    document.getElementById('education-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (education) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Education Record',
      message: `Are you sure you want to delete "${education.degree}" from ${education.instituteName}? This action cannot be undone.`,
      onConfirm: () => confirmDelete(education._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/education/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Education record deleted successfully');
      fetchEducation();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete education record');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const resetForm = () => {
    setFormData({
      degree: '',
      specialization: '',
      instituteName: '',
      location: '',
      status: 'Completed',
      completionYear: '',
      expectedCompletionYear: '',
      grade: '',
      logo: null
    });
    setEditingId(null);
    
    // Reset file input
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, logo: file });
    }
  };

  return (
    <div className="admin-education-page">
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
        <h1>Education Management</h1>
        <p className="page-subtitle">Manage your educational background</p>
      </div>

      <div className="education-content">
        {/* Education Form */}
        <div className="form-section" id="education-form">
          <div className="form-card">
            <h2>{editingId ? 'Edit Education' : 'Add Education'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="degree">Degree/Course Name *</label>
                  <input
                    id="degree"
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g., Bachelor of Technology"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    id="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Computer Science & Engineering"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="instituteName">Institute Name *</label>
                  <input
                    id="instituteName"
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                    placeholder="e.g., Indian Institute of Technology"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Delhi, India"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="form-select"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pursuing">Pursuing</option>
                  </select>
                </div>

                {formData.status === 'Completed' ? (
                  <div className="form-group">
                    <label htmlFor="completionYear">Completion Year *</label>
                    <input
                      id="completionYear"
                      type="number"
                      value={formData.completionYear}
                      onChange={(e) => setFormData({ ...formData, completionYear: e.target.value })}
                      placeholder="e.g., 2023"
                      min="1950"
                      max={new Date().getFullYear()}
                      required
                      className="form-input"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="expectedCompletionYear">Expected Completion Year *</label>
                    <input
                      id="expectedCompletionYear"
                      type="number"
                      value={formData.expectedCompletionYear}
                      onChange={(e) => setFormData({ ...formData, expectedCompletionYear: e.target.value })}
                      placeholder="e.g., 2025"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      required
                      className="form-input"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="grade">Grade/Percentage/CGPA</label>
                  <input
                    id="grade"
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., 8.5 CGPA, 85%, A Grade"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="logo-upload">Institute Logo</label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-input"
                  />
                  <p className="form-hint">Recommended: 320x180px (16:9 ratio), Max 5MB (JPG, PNG, SVG)</p>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Education' : 'Add Education'}
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

        {/* Education List */}
        <div className="list-section">
          <div className="list-card">
            <h2>Education Records ({educationData.length})</h2>
            <div className="education-list">
              {educationData.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <p>No education records found</p>
                </div>
              ) : (
                educationData.map((education) => (
                  <div key={education._id} className="education-card">
                    <div className="education-card-header">
                      <div className="educations-logo">
                        {education.logo ? (
                          <img src={education.logo} alt={`${education.instituteName} logo`} />
                        ) : (
                          <div className="educations-logo-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="education-card-actions">
                        <button
                          onClick={() => handleEdit(education)}
                          className="btn-edit"
                          title="Edit education"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(education)}
                          className="btn-deletes"
                          title="Delete education"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="education-card-content">
                      <h3 className="education-degree">
                        {education.degree}
                        {education.specialization && <span className="specialization"> - {education.specialization}</span>}
                      </h3>
                      
                      <h4 className="education-institute">
                        {education.instituteName}
                        {education.location && <span className="location"> - {education.location}</span>}
                      </h4>

                      <div className="education-meta">
                        <div className="education-status-info">
                          <span className={`status-badge ${education.status.toLowerCase()}`}>
                            {education.status}
                          </span>
                          {education.status === 'Completed' && education.completionYear && (
                            <span className="year-info">{education.completionYear}</span>
                          )}
                          {education.status === 'Pursuing' && education.expectedCompletionYear && (
                            <span className="year-info">Expected: {education.expectedCompletionYear}</span>
                          )}
                        </div>
                        {education.grade && (
                          <div className="grade-info">
                            <span className="grade-label">Grade:</span>
                            <span className="grade-value">{education.grade}</span>
                          </div>
                        )}
                      </div>
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

export default AdminEducation;
