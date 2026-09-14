const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HeroContent = require('../models/HeroContent');
const { protect } = require('../middleware/auth');

// Multer for hero image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'hero-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const mongoose = require('mongoose');

const DEFAULT_HERO = {
  badgeText: '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কম্বো',
  headlineMain: 'তাঁতে বোনা সুতির শাড়ি',
  headlineSub: 'কম্বো গিফট সেট',
  subHeadline: 'প্রিয়জনকে সেরা উপহার দিন',
  description: 'হাতে বোনা খাঁটি তাঁতের শাড়ি সহ ১১টি লাক্সারি আইটেমের পূর্ণ কম্বো সেট।',
  ctaText: 'অর্ডার করতে চাই',
  ctaSubText: 'কালার সিলেক্ট করে সরাসরি অর্ডার করুন',
  desktopImage: '',
};

// @route   GET /api/hero/public
// @desc    Get hero content (public)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, hero: DEFAULT_HERO });
    }
    let hero = await HeroContent.findOne({ isActive: true });
    if (!hero) {
      return res.json({ success: true, hero: DEFAULT_HERO });
    }
    res.json({ success: true, hero });
  } catch (err) {
    res.json({ success: true, hero: DEFAULT_HERO });
  }
});


// @route   GET /api/hero
// @desc    Get hero content (admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let hero = await HeroContent.findOne({ isActive: true });
    if (!hero) hero = await HeroContent.create({});
    res.json({ success: true, hero });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
  }
});

// @route   PUT /api/hero
// @desc    Update hero content (admin)
// @access  Private
router.put('/', protect, upload.single('desktopImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.desktopImage = '/images/' + req.file.filename;
    }

    let hero = await HeroContent.findOneAndUpdate(
      { isActive: true },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, hero });
  } catch (err) {
    console.error('Update hero error:', err);
    res.status(500).json({ success: false, message: 'হিরো কন্টেন্ট আপডেট করতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;
