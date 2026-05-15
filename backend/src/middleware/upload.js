const multer = require('multer');
const path = require('path');
const { DATA_DIR } = require('../utils/db');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_MIMES = [...ALLOWED_IMAGE_MIMES, 'application/pdf'];

function createUploader(dest, allowedMimes, maxSizeMB = 5) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(DATA_DIR, dest)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(Object.assign(new Error(`Invalid file type: ${file.mimetype}`), {
          status: 400,
          code: 'INVALID_FILE_TYPE',
        }));
      }
    },
  });
}

const logoUploader = createUploader('uploads/logo', ALLOWED_IMAGE_MIMES, 2);
const vaccinaUploader = createUploader('uploads', ALLOWED_DOC_MIMES, 10);

module.exports = { logoUploader, vaccinaUploader };
