const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, skills, location, jobType, salary, experienceRequired, deadline } = req.body;

    if (!title || !description || !requirements || !location || !jobType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, requirements, location, and jobType are required.',
      });
    }

    // Normalize skills array
    let parsedSkills = [];
    if (skills) {
      parsedSkills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      skills: parsedSkills,
      location: location.trim(),
      jobType,
      salary: salary || { min: 0, max: 0, currency: 'INR' },
      experienceRequired: experienceRequired?.trim(),
      deadline: deadline ? new Date(deadline) : undefined,
      recruiter: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully.',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active jobs (public job board)
// @route   GET /api/jobs
// @access  Public
const getActiveJobs = async (req, res, next) => {
  try {
    const { search, jobType, location, page = 1, limit = 10 } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: location, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiter', 'name company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name company designation');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by logged-in recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter only)
const getMyJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { recruiter: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only, own jobs)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Only the recruiter who created the job can edit it
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job.',
      });
    }

    const allowedUpdates = ['title', 'description', 'requirements', 'skills', 'location', 'jobType', 'salary', 'experienceRequired', 'status', 'deadline'];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive a job (soft delete)
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only, own jobs)
const archiveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive this job.',
      });
    }

    job.status = 'archived';
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getActiveJobs,
  getJobById,
  getMyJobs,
  updateJob,
  archiveJob,
};