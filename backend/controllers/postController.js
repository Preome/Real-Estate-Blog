const Post = require('../models/Post');
const Search = require('../models/Search');
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

// @desc    Search posts with filters (with search tracking)
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
      
      // Track this search term (don't await to avoid slowing response)
      Search.trackSearch(q).catch(err => console.error('Search tracking error:', err));
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

// Helper function to assign icons based on search term
function getIconForTerm(term) {
  const termLower = term.toLowerCase();
  if (termLower.includes('luxury') || termLower.includes('villa')) return '🏰';
  if (termLower.includes('beach') || termLower.includes('ocean') || termLower.includes('sea')) return '🏖️';
  if (termLower.includes('invest') || termLower.includes('profit') || termLower.includes('roi')) return '💰';
  if (termLower.includes('modern') || termLower.includes('design') || termLower.includes('contemporary')) return '🎨';
  if (termLower.includes('smart') || termLower.includes('tech') || termLower.includes('automation')) return '🤖';
  if (termLower.includes('penthouse') || termLower.includes('high') || termLower.includes('sky')) return '🏙️';
  if (termLower.includes('garden') || termLower.includes('green') || termLower.includes('nature')) return '🌳';
  if (termLower.includes('downtown') || termLower.includes('city') || termLower.includes('urban')) return '🏢';
  if (termLower.includes('condo')) return '🏢';
  if (termLower.includes('apartment')) return '🏢';
  if (termLower.includes('house') || termLower.includes('home')) return '🏠';
  if (termLower.includes('pool')) return '🏊';
  if (termLower.includes('mountain') || termLower.includes('view')) return '⛰️';
  if (termLower.includes('cheap') || termLower.includes('affordable') || termLower.includes('budget')) return '💵';
  return '🔍';
}

// @desc    Get popular search terms (REAL - based on actual searches)
// @route   GET /api/posts/popular-searches
// @access  Public
exports.getPopularSearches = async (req, res) => {
  try {
    // FIRST: Get popular searches from database (actual user searches)
    const popularFromDB = await Search.getPopular(8);
    
    if (popularFromDB.length > 0) {
      // Format popular searches from actual user data
      const popularSearches = popularFromDB.map(search => ({
        term: search.term.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        query: search.term,
        icon: getIconForTerm(search.term),
        count: search.count,
        source: 'database'
      }));
      
      return res.status(200).json({
        success: true,
        data: popularSearches,
        source: 'database'
      });
    }
    
    // SECOND: If no searches yet, get popular terms from post content
    const posts = await Post.find({}, { title: 1, description: 1 });
    const wordFrequency = {};
    
    // Important real estate keywords to track
    const importantWords = [
      'luxury', 'villa', 'beach', 'modern', 'investment', 'penthouse', 
      'garden', 'downtown', 'condo', 'apartment', 'house', 'estate', 
      'pool', 'ocean', 'mountain', 'smart', 'green', 'city', 'view'
    ];
    
    posts.forEach(post => {
      const text = (post.title + ' ' + post.description).toLowerCase();
      const words = text.match(/\b[a-z]{3,}\b/g) || [];
      
      words.forEach(word => {
        if (importantWords.includes(word)) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });
    
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    if (sortedWords.length > 0) {
      const popularSearches = sortedWords.map(([word, count]) => ({
        term: word.charAt(0).toUpperCase() + word.slice(1),
        query: word,
        icon: getIconForTerm(word),
        count: count,
        source: 'content'
      }));
      
      return res.status(200).json({
        success: true,
        data: popularSearches,
        source: 'content'
      });
    }
    
    // THIRD: Ultimate fallback - common real estate terms (only if no data exists)
    const fallbackSearches = [
      { term: "Luxury", query: "luxury", icon: "🏰", count: 0, source: 'fallback' },
      { term: "Modern", query: "modern", icon: "🎨", count: 0, source: 'fallback' },
      { term: "Beach", query: "beach", icon: "🏖️", count: 0, source: 'fallback' },
      { term: "Investment", query: "investment", icon: "💰", count: 0, source: 'fallback' }
    ];
    
    res.status(200).json({
      success: true,
      data: fallbackSearches,
      source: 'fallback'
    });
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(200).json({
      success: true,
      data: [
        { term: "Luxury", query: "luxury", icon: "🏰", count: 0 },
        { term: "Modern", query: "modern", icon: "🎨", count: 0 },
        { term: "Beach", query: "beach", icon: "🏖️", count: 0 },
        { term: "Investment", query: "investment", icon: "💰", count: 0 }
      ],
      source: 'error-fallback'
    });
  }
};