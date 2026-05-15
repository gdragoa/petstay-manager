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

async function fileExists(relativePath) {
  if (!relativePath) return false;
  const fullPath = path.join(DATA_DIR, relativePath);
  try {
    assertInsideDataDir(fullPath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

function serveFile(res, relativePath, downloadName) {
  if (!relativePath) return res.status(404).json({ success: false, error: 'File not found', code: 'NOT_FOUND' });
  const fullPath = path.join(DATA_DIR, relativePath);
  try { assertInsideDataDir(fullPath); } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid path', code: 'INVALID_PATH' });
  }
  if (!fs.existsSync(fullPath)) return res.status(404).json({ success: false, error: 'File not found', code: 'NOT_FOUND' });
  if (downloadName) return res.download(fullPath, downloadName);
  return res.sendFile(fullPath);
}

function createUploader(allowedMimes, maxSizeMB = 5) {
  return multer({
    storage: multer.memoryStorage(),
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

module.exports = { saveFile, readFile, getFileUrl, deleteFile, fileExists, serveFile, createUploader };
