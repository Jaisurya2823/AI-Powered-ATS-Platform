const Application = require('../models/Application');
const Job = require('../models/Job');
const { analyzeResume } = require('../utils/aiService');

// @desc    Analyze a single application with AI
// @route   POST /api/ai/analyze/:applicationId
// @access  Private (Recruiter only)
const analyzeApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('job', 'title description requirements skills recruiter')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization check
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to analyze this application.',
      });
    }

    if (!application.resumeText || application.resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is too short or unavailable for AI analysis. The file may be image-based.',
      });
    }

    // Run AI analysis
    const analysisResult = await analyzeResume(application.resumeText, application.job);

    // Save analysis result to DB
    application.aiAnalysis = analysisResult;
    // Auto-move to screening if still at applied stage
    if (application.status === 'applied') {
      application.status = 'screening';
      application.statusHistory.push({
        status: 'screening',
        note: 'Moved to screening after AI analysis',
        changedBy: req.user._id,
        changedAt: new Date(),
      });
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'AI analysis completed.',
      aiAnalysis: application.aiAnalysis,
      applicationId: application._id,
    });
  } catch (error) {
    // AI-specific error response
    if (error.message?.includes('AI analysis failed')) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again in a moment.',
        error: error.message,
      });
    }
    next(error);
  }
};

// @desc    Bulk analyze all unanalyzed applications for a job
// @route   POST /api/ai/bulk-analyze/:jobId
// @access  Private (Recruiter only)
const bulkAnalyzeApplications = async (req, res, next) => {
  try {
    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not authorized.',
      });
    }

    // Get all unanalyzed applications with resume text
    const applications = await Application.find({
      job: req.params.jobId,
      'aiAnalysis.isAnalyzed': false,
      resumeText: { $exists: true, $ne: '' },
    }).limit(20); // Limit to 20 per batch to avoid rate limits

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No unanalyzed applications found.',
        processed: 0,
        failed: 0,
      });
    }

    let processed = 0;
    let failed = 0;
    const errors = [];

    // Process one at a time to avoid Groq rate limits
    for (const application of applications) {
      try {
        const analysisResult = await analyzeResume(application.resumeText, job);
        application.aiAnalysis = analysisResult;

        if (application.status === 'applied') {
          application.status = 'screening';
          application.statusHistory.push({
            status: 'screening',
            note: 'Auto-moved to screening via bulk AI analysis',
            changedBy: req.user._id,
            changedAt: new Date(),
          });
        }

        await application.save();
        processed++;

        // Delay between API calls to respect rate limits
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        failed++;
        errors.push({ applicationId: application._id, error: err.message });
        console.error(`Bulk analysis failed for ${application._id}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk analysis complete.`,
      processed,
      failed,
      total: applications.length,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ranked candidates for a job (sorted by AI score)
// @route   GET /api/ai/rankings/:jobId
// @access  Private (Recruiter only)
const getCandidateRankings = async (req, res, next) => {
  try {
    const { minScore = 0, recommendation, page = 1, limit = 20 } = req.query;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not authorized.',
      });
    }

    const query = {
      job: req.params.jobId,
      'aiAnalysis.isAnalyzed': true,
      'aiAnalysis.matchScore': { $gte: parseInt(minScore) },
    };

    if (recommendation) {
      query['aiAnalysis.recommendation'] = recommendation;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email phone profileSummary')
        .select('-resumeText')
        .sort({ 'aiAnalysis.matchScore': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query),
    ]);

    // Stats summary
    const stats = await Application.aggregate([
      { $match: { job: job._id, 'aiAnalysis.isAnalyzed': true } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$aiAnalysis.matchScore' },
          maxScore: { $max: '$aiAnalysis.matchScore' },
          minScore: { $min: '$aiAnalysis.matchScore' },
          totalAnalyzed: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || null,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeApplication, bulkAnalyzeApplications, getCandidateRankings };