const express = require('express');
const router = express.Router();
const {
  createJob,
  getActiveJobs,
  getJobById,
  getMyJobs,
  updateJob,
  archiveJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (static routes BEFORE dynamic :id)
router.get('/', getActiveJobs);

// Recruiter-only static routes (MUST be before /:id)
router.post('/', protect, authorize('recruiter'), createJob);
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), getMyJobs);

// Dynamic :id routes (MUST come after all static routes)
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), archiveJob);

module.exports = router;