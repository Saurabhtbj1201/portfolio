import Project from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const { showOnHome, limit } = req.query;
    
    let query = {};
    if (showOnHome === 'true') {
      query.showOnHome = true;
    }

    let projectsQuery = Project.find(query)
      .populate('skills', 'name image')
      .sort({ order: 1, createdAt: -1 });

    if (limit) {
      projectsQuery = projectsQuery.limit(parseInt(limit));
    }

    const projects = await projectsQuery;

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('skills', 'name image');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription, 
      status, 
      completionMonth, 
      completionYear,
      skills,
      links,
      showOnHome
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Project image is required' });
    }

    // Validate required fields
    if (!title || !description || !status) {
      return res.status(400).json({ message: 'Title, description, and status are required' });
    }

    // Validate completion fields for completed projects
    if (status === 'Completed' && (!completionMonth || !completionYear)) {
      return res.status(400).json({ message: 'Completion month and year are required for completed projects' });
    }

    // Validate skills exist
    if (skills && skills.length > 0) {
      const skillIds = Array.isArray(skills) ? skills : [skills];
      const validSkills = await Skill.find({ _id: { $in: skillIds } });
      if (validSkills.length !== skillIds.length) {
        return res.status(400).json({ message: 'One or more selected skills are invalid' });
      }
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/projects',
          transformation: [
            { width: 1200, height: 675, crop: 'fill', gravity: 'center' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Parse links if provided
    let parsedLinks = [];
    if (links) {
      try {
        parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid links format' });
      }
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      detailedDescription: detailedDescription?.trim() || '',
      image: result.secure_url,
      imagePublicId: result.public_id,
      status,
      completionMonth: status === 'Completed' ? completionMonth : undefined,
      completionYear: status === 'Completed' ? completionYear : undefined,
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
      links: parsedLinks,
      showOnHome: showOnHome === 'true' || showOnHome === true
    });

    // Populate skills for response
    await project.populate('skills', 'name image');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription, 
      status, 
      completionMonth, 
      completionYear,
      skills,
      links,
      showOnHome
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Validate completion fields for completed projects
    if (status === 'Completed' && (!completionMonth || !completionYear)) {
      return res.status(400).json({ message: 'Completion month and year are required for completed projects' });
    }

    // Validate skills exist
    if (skills && skills.length > 0) {
      const skillIds = Array.isArray(skills) ? skills : [skills];
      const validSkills = await Skill.find({ _id: { $in: skillIds } });
      if (validSkills.length !== skillIds.length) {
        return res.status(400).json({ message: 'One or more selected skills are invalid' });
      }
    }

    // Handle image update if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (project.imagePublicId) {
        await cloudinary.uploader.destroy(project.imagePublicId);
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/projects',
            transformation: [
              { width: 1200, height: 675, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      project.image = result.secure_url;
      project.imagePublicId = result.public_id;
    }

    // Parse links if provided
    let parsedLinks = project.links;
    if (links !== undefined) {
      try {
        parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid links format' });
      }
    }

    // Update fields
    project.title = title?.trim() || project.title;
    project.description = description?.trim() || project.description;
    project.detailedDescription = detailedDescription?.trim() || project.detailedDescription;
    project.status = status || project.status;
    
    if (status === 'Completed') {
      project.completionMonth = completionMonth;
      project.completionYear = completionYear;
    } else {
      project.completionMonth = undefined;
      project.completionYear = undefined;
    }

    if (skills !== undefined) {
      project.skills = Array.isArray(skills) ? skills : [skills];
    }
    
    project.links = parsedLinks;
    project.showOnHome = showOnHome === 'true' || showOnHome === true;

    await project.save();
    await project.populate('skills', 'name image');

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete image from Cloudinary
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update projects order
// @route   PUT /api/projects/reorder
// @access  Private
export const reorderProjects = async (req, res) => {
  try {
    const { projects } = req.body; // Array of { id, order }

    const updatePromises = projects.map(({ id, order }) =>
      Project.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    console.error('Reorder projects error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle project visibility on home
// @route   PUT /api/projects/:id/toggle-home
// @access  Private
export const toggleHomeVisibility = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.showOnHome = !project.showOnHome;
    await project.save();

    res.json({
      message: `Project ${project.showOnHome ? 'added to' : 'removed from'} home page`,
      showOnHome: project.showOnHome
    });
  } catch (error) {
    console.error('Toggle home visibility error:', error);
    res.status(500).json({ message: error.message });
  }
};
