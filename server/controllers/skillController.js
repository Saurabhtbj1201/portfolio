import { Skill, SkillCategory } from '../models/Skill.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all categories with skills
// @route   GET /api/skills
// @access  Public
export const getSkillsWithCategories = async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ order: 1, createdAt: 1 });
    const categoriesWithSkills = await Promise.all(
      categories.map(async (category) => {
        const skills = await Skill.find({ category: category._id }).sort({ order: 1, createdAt: 1 });
        return {
          ...category.toObject(),
          skills
        };
      })
    );

    res.json(categoriesWithSkills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/skills/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await SkillCategory.find().sort({ order: 1, createdAt: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create skill category
// @route   POST /api/skills/categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if category already exists
    const existingCategory = await SkillCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await SkillCategory.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#667eea'
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update skill category
// @route   PUT /api/skills/categories/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const category = await SkillCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await SkillCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    category.name = name?.trim() || category.name;
    category.description = description?.trim() || category.description;
    category.color = color || category.color;

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete skill category
// @route   DELETE /api/skills/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await SkillCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has skills
    const skillsCount = await Skill.countDocuments({ category: req.params.id });
    if (skillsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It contains ${skillsCount} skill(s). Please delete or move the skills first.` 
      });
    }

    await category.deleteOne();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create skill
// @route   POST /api/skills
// @access  Private
export const createSkill = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Skill image is required' });
    }

    // Verify category exists
    const category = await SkillCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if skill already exists in this category
    const existingSkill = await Skill.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: categoryId 
    });
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already exists in this category' });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/skills',
          transformation: [
            { width: 100, height: 100, crop: 'fill', gravity: 'center' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const skill = await Skill.create({
      name: name.trim(),
      image: result.secure_url,
      imagePublicId: result.public_id,
      category: categoryId
    });

    // Populate category info
    await skill.populate('category');

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get skills by category
// @route   GET /api/skills/category/:categoryId
// @access  Public
export const getSkillsByCategory = async (req, res) => {
  try {
    const skills = await Skill.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ order: 1, createdAt: 1 });

    res.json(skills);
  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
export const updateSkill = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await SkillCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    // Check if new name conflicts with existing skill in the same category
    if (name && (name !== skill.name || categoryId)) {
      const targetCategoryId = categoryId || skill.category;
      const existingSkill = await Skill.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        category: targetCategoryId,
        _id: { $ne: req.params.id }
      });
      if (existingSkill) {
        return res.status(400).json({ message: 'Skill already exists in this category' });
      }
    }

    // Update image if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (skill.imagePublicId) {
        await cloudinary.uploader.destroy(skill.imagePublicId);
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/skills',
            transformation: [
              { width: 100, height: 100, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      skill.image = result.secure_url;
      skill.imagePublicId = result.public_id;
    }

    skill.name = name?.trim() || skill.name;
    if (categoryId) skill.category = categoryId;

    await skill.save();
    await skill.populate('category');

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Delete image from Cloudinary
    if (skill.imagePublicId) {
      await cloudinary.uploader.destroy(skill.imagePublicId);
    }

    await skill.deleteOne();

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update skills order
// @route   PUT /api/skills/reorder
// @access  Private
export const reorderSkills = async (req, res) => {
  try {
    const { skills } = req.body; // Array of { id, order }

    const updatePromises = skills.map(({ id, order }) =>
      Skill.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Skills reordered successfully' });
  } catch (error) {
    console.error('Reorder skills error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update categories order
// @route   PUT /api/skills/categories/reorder
// @access  Private
export const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, order }

    const updatePromises = categories.map(({ id, order }) =>
      SkillCategory.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ message: error.message });
  }
};
