const express = require('express');
const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getMyPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getPosts);

// IMPORTANT: Specific routes MUST come before parameterized routes
router.get('/my-posts', protect, getMyPosts);  // This must be BEFORE /:id

// Parameterized route (must be LAST)
router.get('/:id', getSinglePost);

// Protected routes for single post operations
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;