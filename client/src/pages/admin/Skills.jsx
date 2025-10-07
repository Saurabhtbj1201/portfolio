import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import '../../styles/AdminSkills.css';

const AdminSkills = () => {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#667eea'
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    name: '',
    categoryId: '',
    image: null
  });
  const [editingSkill, setEditingSkill] = useState(null);
  const [uploadingSkill, setUploadingSkill] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSkillsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/skills/categories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(response.data);
      if (response.data.length > 0 && !selectedCategory) {
        setSelectedCategory(response.data[0]._id);
      }
    } catch (error) {
      showError('Failed to fetch categories');
    }
  };

  const fetchSkillsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/skills/category/${categoryId}`);
      setSkills(response.data);
    } catch (error) {
      showError('Failed to fetch skills');
    }
  };

  // Category Management
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (editingCategory) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/skills/categories/${editingCategory._id}`,
          categoryForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showSuccess('Category updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/skills/categories`,
          categoryForm,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showSuccess('Category created successfully');
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#667eea'
    });
  };

  const handleDeleteCategory = (category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteCategory(category._id),
      type: 'danger'
    });
  };

  const confirmDeleteCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/skills/categories/${categoryId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Category deleted successfully');
      fetchCategories();
      
      if (selectedCategory === categoryId) {
        setSelectedCategory('');
        setSkills([]);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '', color: '#667eea' });
    setEditingCategory(null);
  };

  // Skill Management
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    
    if (!skillForm.name.trim()) {
      showError('Skill name is required');
      return;
    }

    if (!skillForm.categoryId) {
      showError('Please select a category');
      return;
    }

    if (!editingSkill && !skillForm.image) {
      showError('Skill image is required');
      return;
    }

    setUploadingSkill(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', skillForm.name.trim());
      formData.append('categoryId', skillForm.categoryId);
      
      if (skillForm.image) {
        formData.append('image', skillForm.image);
      }

      if (editingSkill) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/skills/${editingSkill._id}`,
          formData,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        showSuccess('Skill updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/skills`,
          formData,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        showSuccess('Skill created successfully');
      }

      resetSkillForm();
      if (selectedCategory) {
        fetchSkillsByCategory(selectedCategory);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save skill');
    } finally {
      setUploadingSkill(false);
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      categoryId: skill.category._id,
      image: null
    });
  };

  const handleDeleteSkill = (skill) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Skill',
      message: `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteSkill(skill._id),
      type: 'danger'
    });
  };

  const confirmDeleteSkill = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/skills/${skillId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showSuccess('Skill deleted successfully');
      if (selectedCategory) {
        fetchSkillsByCategory(selectedCategory);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete skill');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const resetSkillForm = () => {
    setSkillForm({ name: '', categoryId: selectedCategory || '', image: null });
    setEditingSkill(null);
    // Reset file input
    const fileInput = document.getElementById('skill-image');
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
      setSkillForm({ ...skillForm, image: file });
    }
  };

  return (
    <div className="admin-skills-page">
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
        <h1>Skills Management</h1>
        <p className="page-subtitle">Manage skill categories and individual skills</p>
      </div>

      <div className="skills-tabs">
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
      </div>

      <div className="skills-content">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="tab-content">
            <div className="content-grid">
              {/* Category Form */}
              <div className="form-card">
                <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <form onSubmit={handleCategorySubmit}>
                  <div className="form-group">
                    <label htmlFor="category-name">Category Name</label>
                    <input
                      id="category-name"
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g., Frontend Technologies"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category-description">Description (Optional)</label>
                    <textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief description of this category"
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category-color">Category Color</label>
                    <div className="color-input-wrapper">
                      <input
                        id="category-color"
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="color-input"
                      />
                      <span className="color-value">{categoryForm.color}</span>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                    {editingCategory && (
                      <button type="button" className="btn-secondary" onClick={resetCategoryForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Categories List */}
              <div className="list-card">
                <h2>Categories ({categories.length})</h2>
                <div className="categories-list">
                  {categories.length === 0 ? (
                    <div className="empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      <p>No categories found</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category._id} className="category-item">
                        <div className="category-info">
                          <div 
                            className="category-color-indicator"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="category-details">
                            <h3 className="category-name">{category.name}</h3>
                            {category.description && (
                              <p className="category-desc">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="category-actions">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="btn-edit"
                            title="Edit category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="btn-deletes"
                            title="Delete category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="tab-content">
            {/* Category Selection */}
            <div className="category-selector">
              <label htmlFor="category-select">Select Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div className="content-grid">
                {/* Skill Form */}
                <div className="form-card">
                  <h2>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
                  <form onSubmit={handleSkillSubmit}>
                    <div className="form-group">
                      <label htmlFor="skill-name">Skill Name</label>
                      <input
                        id="skill-name"
                        type="text"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        placeholder="e.g., React.js"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="skill-category">Category</label>
                      <select
                        id="skill-category"
                        value={skillForm.categoryId}
                        onChange={(e) => setSkillForm({ ...skillForm, categoryId: e.target.value })}
                        required
                        className="form-select"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="skill-image">
                        Skill Image {!editingSkill && <span className="required">*</span>}
                      </label>
                      <input
                        id="skill-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-input"
                      />
                      <p className="form-hint">Recommended: 100x100px, Max 5MB (JPG, PNG, SVG)</p>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={uploadingSkill}
                      >
                        {uploadingSkill ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
                      </button>
                      {editingSkill && (
                        <button type="button" className="btn-secondary" onClick={resetSkillForm}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Skills List */}
                <div className="list-card">
                  <h2>
                    Skills in {categories.find(c => c._id === selectedCategory)?.name} ({skills.length})
                  </h2>
                  <div className="skills-grid">
                    {skills.length === 0 ? (
                      <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                        <p>No skills found in this category</p>
                      </div>
                    ) : (
                      skills.map((skill) => (
                        <div key={skill._id} className="skill-card">
                          <div className="skill-image-container">
                            <img src={skill.image} alt={skill.name} className="skill-image" />
                          </div>
                          <div className="skill-info">
                            <h3 className="skill-name">{skill.name}</h3>
                            <p className="skill-category">{skill.category.name}</p>
                          </div>
                          <div className="skill-actions">
                            <button
                              onClick={() => handleEditSkill(skill)}
                              className="btn-edit"
                              title="Edit skill"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill)}
                              className="btn-deletes"
                              title="Delete skill"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSkills;
