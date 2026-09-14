const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StoreSettings = require('../models/StoreSettings');
const { protect } = require('../middleware/auth');

const DEFAULT_SETTINGS = {
  storeName: 'GIFT VIBES',
  storeTagline: 'Gifts That Create Memories',
  whatsappNumber: '8801828739540',
  phone: '01828739540',
  email: 'rabbanimeheraj03@gmail.com',
  address: '148, Arambag, Motijheel, Dhaka-1000',
  bkashNumber: '01828739540 (Personal)',
  nagadNumber: '01828739540 (Personal)',
  deliveryInsideDhaka: 80,
  deliveryOutsideDhaka: 130,
  deliveryTime: '১ - ৩ দিন',
};

// @route   GET /api/settings/public
// @desc    Get store settings (public — for frontend)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, settings: DEFAULT_SETTINGS });
    }
    let settings = await StoreSettings.findOne({ isActive: true });
    if (!settings) {
      return res.json({ success: true, settings: DEFAULT_SETTINGS });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.json({ success: true, settings: DEFAULT_SETTINGS });
  }
});


// @route   GET /api/settings
// @desc    Get store settings (admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let settings = await StoreSettings.findOne({ isActive: true });
    if (!settings) settings = await StoreSettings.create({});
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings (admin)
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Convert numeric fields
    if (updateData.deliveryInsideDhaka) updateData.deliveryInsideDhaka = Number(updateData.deliveryInsideDhaka);
    if (updateData.deliveryOutsideDhaka) updateData.deliveryOutsideDhaka = Number(updateData.deliveryOutsideDhaka);

    let settings = await StoreSettings.findOneAndUpdate(
      { isActive: true },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, message: 'সেটিংস আপডেট করতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;
