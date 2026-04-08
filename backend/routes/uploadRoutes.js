const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { upload } = require('../cloudinary');
const { uploadImage } = require('../controllers/uploadController');

router.post(
  '/image',
  protect,
  adminOnly,
  upload.single('image'),
  uploadImage
);

module.exports = router;