const cloudinary = require('../config/cloudinary');

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} originalName - Original filename
 * @returns {Object} { url, publicId }
 */
const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    // Strip extension for public_id, keep folder structure
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `resumes/${timestamp}-${randomSuffix}-${baseName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // raw = for non-image files like PDF/DOCX
        public_id: publicId,
        folder: undefined, // folder already included in publicId
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    // Log but don't throw - deletion failure shouldn't break the main flow
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };