const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  updateRecruiterNotes,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Applicant routes
router.post('/:jobId', protect, authorize('applicant'), upload.single('resume'), applyToJob);
router.get('/my', protect, authorize('applicant'), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);
router.put('/:id/notes', protect, authorize('recruiter'), updateRecruiterNotes);

// Both roles (authorization handled inside controller)
router.get('/:id', protect, getApplicationById);

module.exports = router;