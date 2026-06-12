const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `globalcabs/${req.uploadFolder || 'misc'}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf'],
    transformation: file.mimetype === 'application/pdf' ? undefined : [{ quality: 'auto', fetch_format: 'auto' }],
  }),
});

const fileFilter = (req, file, cb) => {
  const ok = /image\/(jpe?g|png|webp|avif)|application\/pdf/.test(file.mimetype);
  cb(ok ? null : new AppError('Only images (jpg/png/webp/avif) and PDFs are allowed', 400), ok);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const setFolder = (folder) => (req, res, next) => { req.uploadFolder = folder; next(); };

module.exports = { upload, setFolder };
