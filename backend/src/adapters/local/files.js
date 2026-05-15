const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { DATA_DIR, assertInsideDataDir } = require('./db');

async function saveFile(buffer, relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);
  assertInsideDataDir(fullPath);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, buffer);
  return relativePath;
}

async function readFile(relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);
  assertInsideDataDir(fullPath);
  return fs.promises.readFile(fullPath);
}

function getFileUrl(relativePath) {
  return '/' + relativePath.replace(/\\/g, '/');
}

async function deleteFile(relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);
  assertInsideDataDir(fullPath);
  if (fs.existsSync(fullPath)) await fs.promises.unlink(fullPath);
}

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
      if (allowedMimes.includes(file.mimetype)) return cb(null, true);
      cb(Object.assign(new Error(`Invalid file type: ${file.mimetype}`), {
        status: 400,
        code: 'INVALID_FILE_TYPE',
      }));
    },
  });
}

module.exports = { saveFile, readFile, getFileUrl, deleteFile, createUploader };
