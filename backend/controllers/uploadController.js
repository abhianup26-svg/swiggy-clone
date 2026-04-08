exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message:  'Image uploaded successfully!',
      imageUrl: req.file.path,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};