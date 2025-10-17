import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminArticles.css';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    socialLinks: [],
    status: 'Draft'
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState({ platform: 'Medium', url: '', customName: '' });

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

  const platformOptions = [
    'Medium', 'Blogger', 'LinkedIn', 'Personal Blog', 'GitHub', 'Quora', 'Custom'
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles`);
      setArticles(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching articles:', error);
      showError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      socialLinks: [],
      status: 'Draft'
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setNewSocialLink({ platform: 'Medium', url: '', customName: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSocialLink = () => {
    if (!newSocialLink.url.trim()) {
      showError('Please enter a valid URL');
      return;
    }
    
    if (newSocialLink.platform === 'Custom' && !newSocialLink.customName.trim()) {
      showError('Please enter a custom platform name');
      return;
    }

    const linkToAdd = {
      platform: newSocialLink.platform,
      url: newSocialLink.url.trim(),
      customName: newSocialLink.platform === 'Custom' ? newSocialLink.customName.trim() : ''
    };

    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, linkToAdd]
    }));

    setNewSocialLink({ platform: 'Medium', url: '', customName: '' });
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        showError('Article title is required');
        setUploading(false);
        return;
      }

      if (!formData.description.trim()) {
        showError('Article description is required');
        setUploading(false);
        return;
      }

      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'socialLinks') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/articles/${editingId}`, submitData, config);
        showSuccess('Article updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/articles`, submitData, config);
        showSuccess('Article created successfully');
      }

      fetchArticles();
      resetForm();
    } catch (error) {
      console.error('Error saving article:', error);
      
      // Handle specific error messages
      if (error.response?.status === 400) {
        showError(error.response.data.message || 'Invalid article data');
      } else if (error.response?.status === 500) {
        showError(error.response.data.message || 'Server error occurred');
      } else {
        showError('Failed to save article. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      description: article.description,
      socialLinks: article.socialLinks || [],
      status: article.status
    });
    
    if (article.thumbnail) {
      setThumbnailPreview(article.thumbnail);
    }
    
    setEditingId(article._id);
    setShowForm(true);
  };

  const handleDelete = (article) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Article',
      message: `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(article._id),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccess('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      showError('Failed to delete article');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const toggleStatus = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/articles/${articleId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess(response.data.message);
      fetchArticles();
    } catch (error) {
      console.error('Error toggling status:', error);
      showError('Failed to update article status');
    }
  };

  if (loading) {
    return (
      <div className="admin-articles">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-articles">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      <div className="admin-header">
        <h1>Articles Management</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Article
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => !uploading && resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Article' : 'Create New Article'}</h2>
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

            <form onSubmit={handleSubmit} className="article-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter article title"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Enter article description or summary"
                  />
                </div>

                <div className="form-group">
                  <label>Thumbnail Image</label>
                  {thumbnailPreview && (
                    <div className="image-preview">
                      <img src={thumbnailPreview} alt="Thumbnail preview" />
                      <button 
                        type="button" 
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview(null);
                        }}
                        className="remove-image-btn"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Draft">Save as Draft</option>
                    <option value="Published">Publish</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Social Links</label>
                <div className="social-links-container">
                  <div className="social-link-form">
                    <select
                      value={newSocialLink.platform}
                      onChange={(e) => setNewSocialLink(prev => ({ 
                        ...prev, 
                        platform: e.target.value,
                        customName: e.target.value === 'Custom' ? prev.customName : ''
                      }))}
                    >
                      {platformOptions.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>

                    {newSocialLink.platform === 'Custom' && (
                      <input
                        type="text"
                        value={newSocialLink.customName}
                        onChange={(e) => setNewSocialLink(prev => ({ ...prev, customName: e.target.value }))}
                        placeholder="Platform name"
                      />
                    )}

                    <input
                      type="url"
                      value={newSocialLink.url}
                      onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="Article URL"
                    />

                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="add-link-btn"
                    >
                      Add
                    </button>
                  </div>

                  {formData.socialLinks.length > 0 && (
                    <div className="social-links-list">
                      {formData.socialLinks.map((link, index) => (
                        <div key={index} className="social-link-item">
                          <div className="link-info">
                            <span className="platform">
                              {link.platform === 'Custom' ? link.customName : link.platform}
                            </span>
                            <span className="url">{link.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="remove-link-btn"
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
                  {uploading ? 'Saving...' : (editingId ? 'Update Article' : 'Create Article')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="articles-list">
        {articles.length === 0 ? (
          <div className="no-articles">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p>No articles created yet</p>
            <button className="add-first-btn" onClick={() => setShowForm(true)}>
              Create First Article
            </button>
          </div>
        ) : (
          articles.map(article => (
            <div key={article._id} className="article-item">
              <div className="article-header-admin">
                <div className="article-main">
                  {article.thumbnail && (
                    <img src={article.thumbnail} alt={article.title} className="article-thumbnail-small" />
                  )}
                  <div>
                    <h3>{article.title}</h3>
                    <p className="article-description-admin">
                      {article.description.length > 100 
                        ? `${article.description.substring(0, 100)}...` 
                        : article.description
                      }
                    </p>
                    <div className="article-meta-admin">
                      <span className={`status-badge ${article.status.toLowerCase()}`}>
                        {article.status}
                      </span>
                      <span className="date-badge">
                        {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                      </span>
                      {article.socialLinks && article.socialLinks.length > 0 && (
                        <span className="links-count">
                          {article.socialLinks.length} link{article.socialLinks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="article-actions">
                  <button
                    onClick={() => toggleStatus(article._id)}
                    className={`status-btn ${article.status.toLowerCase()}`}
                    title={article.status === 'Published' ? 'Save as draft' : 'Publish article'}
                  >
                    {article.status === 'Published' ? 'Draft' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleEdit(article)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {article.socialLinks && article.socialLinks.length > 0 && (
                <div className="article-links-admin">
                  <strong>Article Links:</strong>
                  <div className="link-list">
                    {article.socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="article-link-admin"
                      >
                        {link.platform === 'Custom' ? link.customName : link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
