import Article from '../models/Article.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
export const getArticles = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status === 'published') {
      query.status = 'Published';
    } else if (status === 'draft') {
      query.status = 'Draft';
    }

    const articles = await Article.find(query)
      .sort({ order: 1, publishedAt: -1, createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get article by ID
// @route   GET /api/articles/:id
// @access  Public
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private
export const createArticle = async (req, res) => {
  try {
    const { title, description, socialLinks, status } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Handle thumbnail upload
    let thumbnail = '';
    let thumbnailPublicId = '';

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/articles',
            transformation: [
              { width: 800, height: 450, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      thumbnail = result.secure_url;
      thumbnailPublicId = result.public_id;
    }

    // Parse social links
    let parsedSocialLinks = [];
    if (socialLinks) {
      try {
        parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid social links format' });
      }
    }

    const article = await Article.create({
      title: title.trim(),
      description: description.trim(),
      thumbnail,
      thumbnailPublicId,
      socialLinks: parsedSocialLinks,
      status: status || 'Draft'
    });

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: error.message || 'Failed to create article' });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const { title, description, socialLinks, status } = req.body;

    // Handle thumbnail update
    if (req.file) {
      // Delete old thumbnail if exists
      if (article.thumbnailPublicId) {
        try {
          await cloudinary.uploader.destroy(article.thumbnailPublicId);
        } catch (deleteError) {
          console.error('Error deleting old thumbnail:', deleteError);
        }
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio/articles',
            transformation: [
              { width: 800, height: 450, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      article.thumbnail = result.secure_url;
      article.thumbnailPublicId = result.public_id;
    }

    // Parse and update social links
    if (socialLinks !== undefined) {
      try {
        article.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid social links format' });
      }
    }

    // Update fields
    if (title) article.title = title.trim();
    if (description) article.description = description.trim();
    if (status) article.status = status;

    await article.save();

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: error.message || 'Failed to update article' });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Delete thumbnail from Cloudinary
    if (article.thumbnailPublicId) {
      await cloudinary.uploader.destroy(article.thumbnailPublicId);
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle article status
// @route   PUT /api/articles/:id/toggle-status
// @access  Private
export const toggleStatus = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.status = article.status === 'Published' ? 'Draft' : 'Published';
    await article.save();

    res.json({
      message: `Article ${article.status === 'Published' ? 'published' : 'saved as draft'}`,
      status: article.status
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update articles order
// @route   PUT /api/articles/reorder
// @access  Private
export const reorderArticles = async (req, res) => {
  try {
    const { articles } = req.body; // Array of { id, order }

    const updatePromises = articles.map(({ id, order }) =>
      Article.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Articles reordered successfully' });
  } catch (error) {
    console.error('Reorder articles error:', error);
    res.status(500).json({ message: error.message });
  }
};
