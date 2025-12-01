const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Warning: Cloudinary credentials not found. Image uploads may fail.');
}

// Determine folder based on route path
const getFolder = (req) => {
  if (req.path) {
    if (req.path.includes('slider')) return 'sliders';
    else if (req.path.includes('product')) return 'products';
    else if (req.path.includes('team')) return 'team';
    else if (req.path.includes('gallery')) return 'gallery';
    else if (req.path.includes('news')) return 'news';
  }
  return 'uploads';
};

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine prefix based on route path
    let prefix = 'file';
    if (req.path) {
      if (req.path.includes('slider')) prefix = 'slider';
      else if (req.path.includes('product')) prefix = 'product';
      else if (req.path.includes('team')) prefix = 'team';
      else if (req.path.includes('gallery')) prefix = 'gallery';
      else if (req.path.includes('news')) prefix = 'news';
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = getFolder(req);
    
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const format = ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : undefined;
    
    return {
      folder: folder,
      public_id: `${prefix}-${uniqueSuffix}`,
      ...(format && { format: format }),
      resource_type: 'image'
    };
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;

