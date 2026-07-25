const express = require('express');
const router = express.Router();
const {
  analyzeApplication,
  bulkAnalyzeApplications,
  getCandidateRankings,
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// All AI routes are recruiter-only
router.post('/analyze/:applicationId', protect, authorize('recruiter'), analyzeApplication);
router.post('/bulk-analyze/:jobId', protect, authorize('recruiter'), bulkAnalyzeApplications);
router.get('/rankings/:jobId', protect, authorize('recruiter'), getCandidateRankings);

module.exports = router;