// middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist (profiles, content covers/images, portfolios, misc)
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const uploadDirs = [
  'uploads/profiles',
  'uploads/content/covers',
  'uploads/content/images',
  'uploads/portfolios',
  'uploads/misc'
];
uploadDirs.forEach(dir => ensureDirectoryExists(dir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Route fieldname to folder
    switch (file.fieldname) {
      case 'profilePicture':
      case 'coverPhoto':
        uploadPath += 'profiles/';
        break;
      case 'portfolioPhotos':
        uploadPath += 'portfolios/';
        break;
      case 'coverImage':
        uploadPath += 'content/covers/';
        break;
      case 'contentImages':
        uploadPath += 'content/images/';
        break;
      default:
        uploadPath += 'misc/';
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    cb(null, `${file.fieldname}-${uniqueSuffix}-${basename}${extension}`);
  }
});

// File filter: only images allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10                   // max 10 files per request
  }
});

// Middleware variants
const uploadMiddleware = {
  // Single file fields
  profilePicture: upload.single('profilePicture'),
  coverPhoto: upload.single('coverPhoto'),

  // Multiple files arrays
  portfolioPhotos: upload.array('portfolioPhotos', 10),
  contentImages: upload.array('contentImages', 10),

  // Mixed fields: coverImage + contentImages
  mixed: upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]),

  // Error handling
  handleUploadErrors: (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB per file.'
          });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed.'
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name for file upload.'
          });
        default:
          return res.status(400).json({
            success: false,
            message: `Multer error: ${error.message}`
          });
      }
    } else if (error) {
      // Non-Multer errors (e.g., invalid file type)
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next();
  }
};

// Delete a file from disk
const deleteFile = (filePath) => {
  if (!filePath) return false;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }
  return false;
};

// Validate image dimensions (optional utility)
const validateImageDimensions = (filePath, minWidth = 100, minHeight = 100) => {
  return new Promise((resolve, reject) => {
    const sharp = require('sharp');
    sharp(filePath)
      .metadata()
      .then(({ width, height }) => {
        if (width < minWidth || height < minHeight) {
          reject(new Error(`Image must be at least ${minWidth}x${minHeight} pixels`));
        } else {
          resolve({ width, height });
        }
      })
      .catch(reject);
  });
};

// Helper to convert file path to public URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || 'http://localhost:8001';
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Video upload for portfolio videos
const portfolioVideos = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/portfolios/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
}).array('portfolioVideos', 10);

module.exports = {
  uploadMiddleware,
  deleteFile,
  validateImageDimensions,
  getFileUrl,
  ensureDirectoryExists,
  portfolioVideos,
};
