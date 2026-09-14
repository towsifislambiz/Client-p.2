const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');
const { protect } = require('../middleware/auth');

const DELIVERY_INSIDE = 80;
const DELIVERY_OUTSIDE = 130;

// @route   POST /api/orders
// @desc    Create a new order (public — customer facing)
// @access  Public
router.post(
  '/',
  [
    body('customer.name').notEmpty().withMessage('নাম আবশ্যক'),
    body('customer.phone').notEmpty().withMessage('ফোন নম্বর আবশ্যক'),
    body('customer.address').notEmpty().withMessage('ঠিকানা আবশ্যক'),
    body('items').isArray({ min: 1 }).withMessage('কমপক্ষে একটি পণ্য থাকতে হবে'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customer, items, district } = req.body;

    try {
      // Fetch store settings for delivery fees
      let settings = await StoreSettings.findOne({ isActive: true });
      const deliveryInside = settings ? settings.deliveryInsideDhaka : DELIVERY_INSIDE;
      const deliveryOutside = settings ? settings.deliveryOutsideDhaka : DELIVERY_OUTSIDE;

      // SERVER-SIDE price verification — never trust client-sent totals
      let serverSubtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const hasValidDbId = item.productId && mongoose.Types.ObjectId.isValid(item.productId);
        if (!hasValidDbId) {
          // Legacy/frontend item without DB id — use submitted price with basic sanity check
          const itemPrice = Math.max(0, Number(item.price) || 0);
          const itemQty = Math.max(1, Number(item.quantity) || 1);
          serverSubtotal += itemPrice * itemQty;
          verifiedItems.push({
            name: item.name || 'Unknown',
            banglaName: item.banglaName || '',
            selectedColor: item.selectedColor || '',
            price: itemPrice,
            quantity: itemQty,
            image: item.image || '',
          });
        } else {
          // DB-backed product — verify price and check stock
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({
              success: false,
              message: `পণ্য পাওয়া যায়নি: ${item.productId}`,
            });
          }

          const itemQty = Math.max(1, Number(item.quantity) || 1);

          // Stock check
          if (product.stock < itemQty) {
            return res.status(400).json({
              success: false,
              message: `দুঃখিত, "${product.name}" এর স্টক পর্যাপ্ত নেই। বর্তমান স্টক: ${product.stock}`,
            });
          }

          // Decrement stock atomically
          await Product.findByIdAndUpdate(product._id, {
            $inc: { stock: -itemQty },
            ...(product.stock - itemQty <= 0 ? { inStock: false } : {}),
          });

          serverSubtotal += product.price * itemQty;
          verifiedItems.push({
            productId: product._id,
            name: product.name,
            banglaName: product.banglaName || '',
            selectedColor: item.selectedColor || '',
            price: product.price,
            quantity: itemQty,
            image: product.image || '',
          });
        }
      }

      const deliveryFee =
        (customer.district || district) === 'outsideDhaka' ? deliveryOutside : deliveryInside;
      const grandTotal = serverSubtotal + deliveryFee;

      const order = await Order.create({
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          district: customer.district || district || 'insideDhaka',
          paymentMethod: customer.paymentMethod || 'COD',
          trxId: customer.trxId || '',
        },
        items: verifiedItems,
        subtotal: serverSubtotal,
        deliveryFee,
        grandTotal,
      });

      res.status(201).json({
        success: true,
        order: {
          orderId: order.orderId,
          grandTotal: order.grandTotal,
          deliveryFee: order.deliveryFee,
          subtotal: order.subtotal,
          status: order.status,
          createdAt: order.createdAt,
        },
      });
    } catch (err) {
      console.error('Create order error:', err);
      res.status(500).json({ success: false, message: 'অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে।' });
    }
  }
);

// @route   GET /api/orders
// @desc    Get all orders with pagination (admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      success: true,
      orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
  }
});

// @route   GET /api/orders/analytics
// @desc    Get monthly revenue + order count analytics (admin)
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    // Total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: totalRevenue[0]?.count || 0,
        monthlyRevenue,
        statusBreakdown,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'এনালিটিক্স লোড করতে সমস্যা হয়েছে।' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order (admin)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ অর্ডার আইডি।' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সার্ভার এরর।' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ success: false, message: 'অবৈধ অর্ডার আইডি।' });
  }
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'অবৈধ স্ট্যাটাস।' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;
