const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { DATA_DIR, assertInsideDataDir } = require('./db');

// When BACKEND_PUBLIC_URL is set, stored paths are full URLs (split deployment).
// Otherwise they are relative paths (same-origin or dev).
function toRelative(storedPath) {
  const base = process.env.BACKEND_PUBLIC_URL;
  if (base && storedPath && storedPath.startsWith(base)) {
    return storedPath.slice(base.length).replace(/^\//, '');
  }
  return storedPath ? storedPath.replace(/^\//, '') : storedPath;
}

function toPublic(relativePath) {
  const base = process.env.BACKEND_PUBLIC_URL;
  if (base) return `${base.replace(/\/$/, '')}/${relativePath}`;
  return '/' + relativePath.replace(/\\/g, '/');
}

async function saveFile(buffer, relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);
  assertInsideDataDir(fullPath);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, buffer);
  return toPublic(relativePath);
}

async function readFile(storedPath) {
  const rel = toRelative(storedPath);
  const fullPath = path.join(DATA_DIR, rel);
  assertInsideDataDir(fullPath);
  return fs.promises.readFile(fullPath);
}

function getFileUrl(storedPath) {
  return storedPath; // already transformed at save time
}

async function deleteFile(storedPath) {
  const rel = toRelative(storedPath);
  const fullPath = path.join(DATA_DIR, rel);
  try { assertInsideDataDir(fullPath); } catch { return; }
  if (fs.existsSync(fullPath)) await fs.promises.unlink(fullPath);
}

async function fileExists(storedPath) {
  if (!storedPath) return false;
  const rel = toRelative(storedPath);
  const fullPath = path.join(DATA_DIR, rel);
  try {
    assertInsideDataDir(fullPath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

function serveFile(res, storedPath, downloadName) {
  if (!storedPath) return res.status(404).json({ success: false, error: 'File not found', code: 'NOT_FOUND' });
  // If storedPath is a full URL (BACKEND_PUBLIC_URL mode), redirect
  if (storedPath.startsWith('http')) return res.redirect(302, storedPath);
  const rel = toRelative(storedPath);
  const fullPath = path.join(DATA_DIR, rel);
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
