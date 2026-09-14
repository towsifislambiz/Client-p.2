const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const AdminUser = require('../models/AdminUser');
const { protect } = require('../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const admin = await AdminUser.findOne({ username });
      if (!admin) {
        return res.status(401).json({ success: false, message: 'ইউজারনেম বা পাসওয়ার্ড ভুল।' });
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'ইউজারনেম বা পাসওয়ার্ড ভুল।' });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      const token = signToken(admin._id);

      res.json({
        success: true,
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current admin info
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// @route   POST /api/auth/change-password
// @desc    Change admin password
// @access  Private
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const admin = await AdminUser.findById(req.admin._id);
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
      }

      admin.password = newPassword;
      await admin.save();

      res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout (client removes token)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'লগআউট সফল।' });
});

module.exports = router;
