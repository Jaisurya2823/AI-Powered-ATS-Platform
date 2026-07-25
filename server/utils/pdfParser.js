const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF or DOCX buffer
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type
 * @returns {string} Extracted text
 */
const parseResume = async (buffer, mimeType) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file buffer received');
  }

  if (mimeType === 'application/pdf') {
    return await parsePDF(buffer);
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await parseDOCX(buffer);
  }

  throw new Error('Unsupported file format for parsing');
};

const parsePDF = async (buffer) => {
  try {
    // pdf-parse can hang on corrupt files - add timeout
    const parsePromise = pdfParse(buffer, {
      max: 0, // Parse all pages
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF parsing timed out')), 30000)
    );

    const data = await Promise.race([parsePromise, timeoutPromise]);

    const text = data.text?.trim();
    if (!text) {
      throw new Error('No text could be extracted from PDF. File may be image-based or encrypted.');
    }

    return text;
  } catch (error) {
    if (error.message.includes('timed out') || error.message.includes('No text')) {
      throw error;
    }
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages && result.messages.length > 0) {
      // Log warnings but continue
      console.warn('DOCX parse warnings:', result.messages);
    }

    const text = result.value?.trim();
    if (!text) {
      throw new Error('No text could be extracted from DOCX.');
    }

    return text;
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
};

module.exports = { parseResume };