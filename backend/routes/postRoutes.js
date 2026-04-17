const express = require('express');
const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getMyPosts,
  searchPosts,        // Add this
  getSearchSuggestions // Add this
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);           // Add search route
router.get('/suggestions', getSearchSuggestions); // Add suggestions route
router.get('/:id', getSinglePost);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.get('/my-posts', protect, getMyPosts);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;