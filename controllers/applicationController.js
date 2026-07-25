const Application = require('../models/Application');
const Job = require('../models/Job');
const { uploadToCloudinary } = require('../utils/cloudinaryService');
const { parseResume } = require('../utils/pdfParser');
const { sendApplicationConfirmation, sendStatusUpdateEmail } = require('../utils/emailService');

// @desc    Apply to a job (with resume upload)
// @route   POST /api/applications/:jobId
// @access  Private (Applicant only)
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Validate file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required (PDF or DOCX).',
      });
    }

    // Check job exists and is active
    const job = await Job.findById(jobId).populate('recruiter', 'name company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications.',
      });
    }

    // Check deadline
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed.',
      });
    }

    // Check for duplicate application
    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job.',
      });
    }

    // Upload resume to Cloudinary
    let resumeUrl, resumeKey;
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      resumeUrl = uploadResult.url;
      resumeKey = uploadResult.publicId;
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload resume. Please try again.',
      });
    }

    // Extract text from resume
    let resumeText = '';
    try {
      resumeText = await parseResume(req.file.buffer, req.file.mimetype);
    } catch (parseError) {
      console.warn('Resume text extraction failed:', parseError.message);
      // Continue without text - recruiter can still review manually
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resumeUrl,
      resumeKey,
      resumeText,
      coverLetter: coverLetter?.trim() || '',
      status: 'applied',
      statusHistory: [{ status: 'applied', note: 'Application submitted' }],
    });

    // Increment application count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Send confirmation email (async, non-blocking)
    sendApplicationConfirmation(
      req.user.email,
      req.user.name,
      job.title,
      job.recruiter?.company || 'the company'
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application: {
        _id: application._id,
        job: jobId,
        status: application.status,
        appliedAt: application.createdAt,
        resumeUrl: application.resumeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for logged-in applicant
// @route   GET /api/applications/my
// @access  Private (Applicant only)
const getMyApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find({ applicant: req.user._id })
        .populate('job', 'title location jobType status recruiter')
        .populate({ path: 'job', populate: { path: 'recruiter', select: 'name company' } })
        .select('-resumeText') // Don't send large text field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments({ applicant: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job (Recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only, own jobs)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not authorized.',
      });
    }

    const query = { job: jobId };
    if (status) query.status = status;

    // Build sort
    const sortOptions = {};
    if (sortBy === 'score') {
      sortOptions['aiAnalysis.matchScore'] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicant', 'name email phone profileSummary')
        .select('-resumeText') // Exclude large text field from list
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single application (full details)
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone profileSummary')
      .populate('job', 'title description requirements skills location jobType recruiter');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Applicant can only see their own; recruiter can only see applications for their jobs
    const isApplicant =
      application.applicant._id.toString() === req.user._id.toString();
    const isRecruiter =
      req.user.role === 'recruiter' &&
      application.job.recruiter.toString() === req.user._id.toString();

    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Kanban pipeline)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['applied', 'screening', 'interview', 'offered', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title recruiter')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only the recruiter of the job can update status
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application.',
      });
    }

    const oldStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      note: note?.trim() || '',
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await application.save();

    // Send email notification to applicant on status change
    if (oldStatus !== status && ['screening', 'interview', 'offered', 'rejected'].includes(status)) {
      sendStatusUpdateEmail(
        application.applicant.email,
        application.applicant.name,
        application.job.title,
        status
      );
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated.',
      application: {
        _id: application._id,
        status: application.status,
        statusHistory: application.statusHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruiter notes on application
// @route   PUT /api/applications/:id/notes
// @access  Private (Recruiter only)
const updateRecruiterNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;

    const application = await Application.findById(req.params.id).populate('job', 'recruiter');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    application.recruiterNotes = notes?.trim() || '';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Notes updated.',
      recruiterNotes: application.recruiterNotes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  updateRecruiterNotes,
};