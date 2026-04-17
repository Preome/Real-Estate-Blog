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
  getPopularSearches,
  getPostsByCategory,
  getCategoryStats
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular-searches', getPopularSearches);
router.get('/categories/stats', getCategoryStats);  // Add this
router.get('/category/:category', getPostsByCategory);  // Add this
router.get('/my-posts', protect, getMyPosts);
router.get('/:id', getSinglePost);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;