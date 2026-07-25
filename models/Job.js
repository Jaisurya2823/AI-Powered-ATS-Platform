const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: {
      type: String,
      required: [true, 'Requirements are required'],
      maxlength: [3000, 'Requirements cannot exceed 3000 characters'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot list more than 20 skills',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: [true, 'Job type is required'],
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    experienceRequired: {
      type: String,
      trim: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);