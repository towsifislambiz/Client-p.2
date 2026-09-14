const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Multer storage config — saves to client public/images/products/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images/products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const mongoose = require('mongoose');

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, products: [] });
    }
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.json({ success: true, products: [] });
  }
});


// @route   GET /api/products/:id
// @desc    Get single product (public)
// @access  Public
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ পণ্য আইডি।' });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
  }
});

// @route   POST /api/products
// @desc    Create product (admin)
// @access  Private
router.post(
  '/',
  protect,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Product name required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const data = { ...req.body };
      data.price = Number(data.price);
      if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
      if (data.stock !== undefined) data.stock = Number(data.stock);
      if (data.tags && typeof data.tags === 'string') data.tags = data.tags.split(',').map((t) => t.trim());

      if (req.file) {
        data.image = '/images/products/' + req.file.filename;
      }

      const product = await Product.create(data);
      res.status(201).json({ success: true, product });
    } catch (err) {
      console.error('Create product error:', err);
      res.status(500).json({ success: false, message: 'পণ্য তৈরি করতে সমস্যা হয়েছে।' });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product (admin)
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ পণ্য আইডি।' });
  }
  try {
    const data = { ...req.body };
    if (data.price) data.price = Number(data.price);
    if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
    if (data.stock !== undefined) {
      data.stock = Number(data.stock);
      data.inStock = data.stock > 0;
    }
    if (data.tags && typeof data.tags === 'string') data.tags = data.tags.split(',').map((t) => t.trim());

    if (req.file) {
      data.image = '/images/products/' + req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'পণ্য আপডেট করতে সমস্যা হয়েছে।' });
  }
});

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock only (admin)
// @access  Private
router.patch('/:id/stock', protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ পণ্য আইডি।' });
  }
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ success: false, message: 'Stock value required.' });
    }
    const stockNum = Math.max(0, Number(stock));
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: stockNum, inStock: stockNum > 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'স্টক আপডেট করতে সমস্যা হয়েছে।' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (admin)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ পণ্য আইডি।' });
  }
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
    res.json({ success: true, message: 'পণ্য মুছে ফেলা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'পণ্য মুছতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;
