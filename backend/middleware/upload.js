const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Organize by file type
    if (file.fieldname === 'coverImage') {
      uploadPath += 'content/covers/';
    } else if (file.fieldname === 'contentImages') {
      uploadPath += 'content/images/';
    } else {
      uploadPath += 'content/misc/';
    }
    
    // Organize by date
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    uploadPath += `${year}/${month}/`;
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    
    // Sanitize filename
    const sanitizedBasename = basename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for different upload scenarios
const uploadMiddleware = {
  // Single cover image
  coverImage: upload.single('coverImage'),
  
  // Multiple content images
  contentImages: upload.array('contentImages', 10),
  
  // Mixed upload (cover + content images)
  mixed: upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]),
  
  // Error handling middleware
  handleUploadErrors: (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB per file.'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name for file upload.'
        });
      }
    }
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'File upload error occurred.'
    });
  }
};

// Helper function to get file URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // In production, this would be your CDN or static file server URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:8001';
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Helper function to process uploaded files
const processUploadedFiles = (files) => {
  if (!files) return [];
  
  const processFile = (file) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    url: getFileUrl(file.path),
    size: file.size,
    mimetype: file.mimetype
  });
  
  if (Array.isArray(files)) {
    return files.map(processFile);
  } else if (files.coverImage) {
    return {
      coverImage: files.coverImage.map(processFile),
      contentImages: files.contentImages ? files.contentImages.map(processFile) : []
    };
  } else {
    return processFile(files);
  }
};

module.exports = {
  uploadMiddleware,
  getFileUrl,
  deleteFile,
  processUploadedFiles
};