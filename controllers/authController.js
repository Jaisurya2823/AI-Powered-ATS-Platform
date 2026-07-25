const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user (recruiter or applicant)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, designation, phone } = req.body;

    // Input validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['recruiter', 'applicant'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "recruiter" or "applicant".',
      });
    }

    if (role === 'recruiter' && !company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required for recruiters.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user
    const userData = { name: name.trim(), email: email.toLowerCase().trim(), password, role };
    if (role === 'recruiter') {
      userData.company = company.trim();
      if (designation) userData.designation = designation.trim();
    }
    if (role === 'applicant' && phone) {
      userData.phone = phone.trim();
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    // Return user without password
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, company, designation, phone, profileSummary } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (company && req.user.role === 'recruiter') updateData.company = company.trim();
    if (designation) updateData.designation = designation.trim();
    if (phone) updateData.phone = phone.trim();
    if (profileSummary) updateData.profileSummary = profileSummary.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };