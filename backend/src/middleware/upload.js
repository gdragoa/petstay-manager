const { createUploader } = require('../utils/files');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_MIMES = [...ALLOWED_IMAGE_MIMES, 'application/pdf'];

const logoUploader = createUploader('uploads/logo', ALLOWED_IMAGE_MIMES, 2);
const vaccinaUploader = createUploader('uploads', ALLOWED_DOC_MIMES, 10);

module.exports = { logoUploader, vaccinaUploader };
