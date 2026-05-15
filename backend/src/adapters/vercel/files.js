const { put, del } = require('@vercel/blob');
const multer = require('multer');

async function saveFile(buffer, relativePath) {
  const blob = await put(relativePath, buffer, { access: 'public' });
  return blob.url;
}

async function readFile(storedPath) {
  const response = await fetch(storedPath);
  if (!response.ok) throw new Error(`Failed to fetch file: ${storedPath}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getFileUrl(storedPath) {
  return storedPath; // Vercel Blob returns full URLs
}

async function deleteFile(storedPath) {
  if (storedPath) await del(storedPath);
}

async function fileExists(storedPath) {
  return !!storedPath;
}

function serveFile(res, storedPath, _downloadName) {
  if (!storedPath) return res.status(404).json({ success: false, error: 'File not found', code: 'NOT_FOUND' });
  return res.redirect(302, storedPath);
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
