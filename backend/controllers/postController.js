const Post = require('../models/Post');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        error: 'Title and description are required' 
      });
    }
    
    let imageUrl = '';
    let imagePublicId = '';
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to upload image' 
        });
      }
    }
    
    const post = await Post.create({
      title,
      description,
      imageUrl,
      imagePublicId,
      author: req.user.id,
      authorName: req.user.name
    });
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create post',
      details: error.message 
    });
  }
};

// @desc    Get all posts (public)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');
    
    const total = await Post.countDocuments();
    
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch posts',
      details: error.message 
    });
  }
};

// @desc    Get single post (public)
// @route   GET /api/posts/:id
// @access  Public
exports.getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get single post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch post',
      details: error.message 
    });
  }
};

// @desc    Update post (owner only)
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const { title, description } = req.body;
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }
    
    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    
    // Upload new image if provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (post.imagePublicId) {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(post.imagePublicId);
      }
      
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      post.imageUrl = result.secure_url;
      post.imagePublicId = result.public_id;
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update post',
      details: error.message 
    });
  }
};

// @desc    Delete post (owner only)
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      const cloudinary = require('cloudinary').v2;
      await cloudinary.uploader.destroy(post.imagePublicId);
    }
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete post',
      details: error.message 
    });
  }
};

// @desc    Get user's own posts
// @route   GET /api/posts/my-posts
// @access  Private
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch your posts',
      details: error.message 
    });
  }
};

// @desc    Search posts with filters
// @route   GET /api/posts/search
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { 
      q, // search query
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    let searchQuery = {};
    
    if (q && q.trim() !== '') {
      searchQuery = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { authorName: { $regex: q, $options: 'i' } }
        ]
      };
    }
    
    // Get total count for pagination
    const total = await Post.countDocuments(searchQuery);
    
    // Get paginated results
    const posts = await Post.find(searchQuery)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email');
    
    res.status(200).json({
      success: true,
      data: posts,
      searchQuery: q || '',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search posts',
      details: error.message 
    });
  }
};

// @desc    Get search suggestions
// @route   GET /api/posts/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get title suggestions
    const titleSuggestions = await Post.find(
      { title: { $regex: q, $options: 'i' } },
      { title: 1, _id: 1 }
    ).limit(5);
    
    // Get unique author suggestions
    const authorSuggestions = await Post.distinct('authorName', {
      authorName: { $regex: q, $options: 'i' }
    }).limit(3);
    
    res.status(200).json({
      success: true,
      data: {
        titles: titleSuggestions,
        authors: authorSuggestions
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get suggestions'
    });
  }
};