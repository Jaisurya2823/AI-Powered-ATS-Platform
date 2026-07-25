const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
    },
    resumeKey: {
      type: String, // Cloudinary public_id for deletion if needed
      required: true,
    },
    resumeText: {
      type: String, // Extracted text from PDF/DOCX for AI
      default: '',
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offered', 'rejected'],
      default: 'applied',
    },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    // AI Analysis Result
    aiAnalysis: {
      isAnalyzed: { type: Boolean, default: false },
      matchScore: { type: Number, min: 0, max: 100, default: null },
      extractedSkills: { type: [String], default: [] },
      summary: { type: String, default: '' },
      strengths: { type: [String], default: [] },
      gaps: { type: [String], default: [] },
      recommendation: {
        type: String,
        enum: ['Strong Hire', 'Hire', 'Maybe', 'Reject', null],
        default: null,
      },
      analyzedAt: { type: Date, default: null },
    },
    // Recruiter notes
    recruiterNotes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });
// Index for sorting by AI score
applicationSchema.index({ job: 1, 'aiAnalysis.matchScore': -1 });

module.exports = mongoose.model('Application', applicationSchema);