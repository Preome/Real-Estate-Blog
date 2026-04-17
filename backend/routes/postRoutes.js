const express = require('express');
const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getMyPosts,
  searchPosts,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get all posts (public)
router.get('/', getPosts);

// Search posts (public)
router.get('/search', searchPosts);

// Get search suggestions (public)
router.get('/suggestions', getSearchSuggestions);

// Get popular searches (public)
router.get('/popular-searches', getPopularSearches);

// ============================================
// SPECIFIC ROUTES (Must come before /:id)
// ============================================

// Get user's own posts (protected) - MUST BE BEFORE /:id
router.get('/my-posts', protect, getMyPosts);

// ============================================
// PARAMETERIZED ROUTES (Must come last)
// ============================================

// Get single post by ID (public)
router.get('/:id', getSinglePost);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Create new post
router.post('/', protect, upload.single('image'), createPost);

// Update post by ID
router.put('/:id', protect, upload.single('image'), updatePost);

// Delete post by ID
router.delete('/:id', protect, deletePost);

module.exports = router;