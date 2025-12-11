const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Check if Cloudinary is configured
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error('❌ ERROR: Cloudinary credentials are missing!');
  console.error('Required environment variables:');
  console.error('  - CLOUDINARY_CLOUD_NAME:', cloudinaryConfig.cloud_name ? '✅ Set' : '❌ Missing');
  console.error('  - CLOUDINARY_API_KEY:', cloudinaryConfig.api_key ? '✅ Set' : '❌ Missing');
  console.error('  - CLOUDINARY_API_SECRET:', cloudinaryConfig.api_secret ? '✅ Set' : '❌ Missing');
  console.error('Please set these in your Vercel/Render environment variables.');
} else {
  console.log('✅ Cloudinary configured successfully');
  console.log('Cloud Name:', cloudinaryConfig.cloud_name);
}

cloudinary.config(cloudinaryConfig);

// Determine folder based on route path
const getFolder = (req) => {
  if (req.path) {
    if (req.path.includes('slider')) return 'sliders';
    else if (req.path.includes('product')) return 'products';
    else if (req.path.includes('team')) return 'team';
    else if (req.path.includes('gallery')) return 'gallery';
    else if (req.path.includes('news')) return 'news';
    else if (req.path.includes('usage-area')) return 'usage-area';
    else if (req.path.includes('certificate')) return 'certificates';
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
      else if (req.path.includes('usage-area')) prefix = 'usage-area';
      else if (req.path.includes('certificate')) prefix = 'certificate';
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = getFolder(req);
    
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const isPdf = ext === 'pdf';
    const format = ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : undefined;
    
    return {
      folder: folder,
      public_id: `${prefix}-${uniqueSuffix}`,
      ...(format && { format: format }),
      resource_type: isPdf ? 'raw' : 'image' // PDFs are raw files in Cloudinary
    };
  }
});

// File filter - images and PDFs (for certificates)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedPdfTypes = /pdf/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname);
  const isPdf = allowedPdfTypes.test(extname);
  const mimetype = file.mimetype || '';
  
  // Check if it's a PDF field or logo field (certificate routes use these field names)
  const isPdfField = file.fieldname === 'pdf';
  const isLogoField = file.fieldname === 'logo';
  
  // If it's PDF field, only allow PDFs
  if (isPdfField) {
    if (isPdf || mimetype === 'application/pdf' || mimetype.includes('pdf')) {
      return cb(null, true);
    } else {
      return cb(new Error('PDF field only accepts PDF files!'));
    }
  }
  
  // If it's logo field, only allow images
  if (isLogoField) {
    if (isImage || mimetype.startsWith('image/')) {
      return cb(null, true);
    } else {
      return cb(new Error('Logo field only accepts image files!'));
    }
  }
  
  // Check if it's a certificate route (fallback for other fields)
  const isCertificateRoute = (req.path && req.path.includes('certificate')) || 
                             (req.originalUrl && req.originalUrl.includes('certificate')) ||
                             (req.baseUrl && req.baseUrl.includes('certificate')) ||
                             (req.url && req.url.includes('certificate'));
  
  // For certificate routes, allow both images and PDFs
  if (isCertificateRoute) {
    if (isImage || isPdf || mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image and PDF files are allowed!'));
    }
  }
  
  // For other routes, only allow images
  if (isImage && (mimetype.startsWith('image/') || allowedImageTypes.test(mimetype))) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (increased for PDFs)
  },
  fileFilter: fileFilter
});

module.exports = upload;

