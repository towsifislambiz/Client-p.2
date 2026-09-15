require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const storage = require('./services/storage');
const { protect, JWT_SECRET } = require('./middleware/auth');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from all origins (Storefront, Vercel, localhost, localtunnel)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ─── Static Images ────────────────────────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// ─── Rate Limiting for Auth ───────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'অনেক বেশি লগইন চেষ্টা। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
});

// ==============================================================================
// 🌟 REAL-TIME SITE DATA API (https://linkbd.net/api/site-data Architecture)
// ==============================================================================

// 1. GET /api/site-data — Unified real-time site data for Storefront & Admin (1ms response)
app.get(['/api/site-data', '/site-data'], (req, res) => {
  const data = storage.getSiteData();
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(data);
});

// 2. POST /api/site-data/update — Instant update from Admin Panel
app.post(['/api/site-data/update', '/site-data/update'], protect, async (req, res) => {
  const updates = req.body;
  const result = await storage.updateSiteData(updates);
  res.json(result);
});

// 3. POST /api/products/stock — Quick Stock Update (+ / -) from Admin
app.post(['/api/products/stock', '/products/stock'], protect, (req, res) => {
  const { productId, stock } = req.body;
  if (!productId || typeof stock === 'undefined') {
    return res.status(400).json({ success: false, message: 'productId and stock required' });
  }
  const result = storage.updateProductStock(productId, stock);
  res.json(result);
});

// 4. Products CRUD (Public / Admin)
app.get(['/api/products', '/products'], (req, res) => {
  const data = storage.getSiteData();
  res.json({ success: true, products: data.products });
});

app.post(['/api/products', '/products'], protect, async (req, res) => {
  const productData = req.body;
  const result = await storage.saveProduct(productData);
  res.json(result);
});

app.delete(['/api/products/:id', '/products/:id'], protect, (req, res) => {
  const result = storage.deleteProduct(req.params.id);
  res.json(result);
});

// 4.5 Universal WebP Image Upload Endpoint (Any image -> WebP)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.post(['/api/upload', '/upload'], protect, upload.single('image'), async (req, res) => {
  try {
    let buffer = null;
    let originalName = 'uploaded';

    if (req.file) {
      buffer = req.file.buffer;
      originalName = path.parse(req.file.originalname).name;
    } else if (req.body && req.body.image && req.body.image.startsWith('data:image/')) {
      const parts = req.body.image.split(';base64,');
      buffer = Buffer.from(parts[1], 'base64');
      if (req.body.name) originalName = req.body.name;
    }

    if (!buffer) {
      return res.status(400).json({ success: false, message: 'ছবি প্রদান করা হয়নি।' });
    }

    const cleanSlug = originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    const filename = `${cleanSlug}-${Date.now()}.webp`;

    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const uploadDir = path.join(__dirname, '../public/images/products');
    const distUploadDir = path.join(__dirname, '../dist/images/products');

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), webpBuffer);

    if (fs.existsSync(path.dirname(distUploadDir))) {
      if (!fs.existsSync(distUploadDir)) fs.mkdirSync(distUploadDir, { recursive: true });
      fs.writeFileSync(path.join(distUploadDir, filename), webpBuffer);
    }

    const url = `/images/products/${filename}`;
    res.json({ success: true, url, filename, format: 'webp' });
  } catch (err) {
    console.error('Upload conversion error:', err);
    res.status(500).json({ success: false, message: 'WebP কনভার্সন ব্যর্থ হয়েছে: ' + err.message });
  }
});

// 5. Orders API
// Customer Order Submission (Real-time auto stock deduction)
app.post(['/api/orders', '/orders'], (req, res) => {
  const orderData = req.body;
  if (!orderData || !orderData.customer || !orderData.items) {
    return res.status(400).json({ success: false, message: 'অর্ডারের তথ্য অসম্পূর্ণ।' });
  }
  const result = storage.addOrder(orderData);
  res.status(201).json(result);
});

// Admin Orders List
app.get(['/api/orders', '/orders'], protect, (req, res) => {
  const data = storage.getSiteData();
  res.json({ success: true, orders: data.orders || [] });
});

// Admin Order Status Update
app.patch(['/api/orders/:id/status', '/orders/:id/status'], protect, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status required' });
  }
  const result = storage.updateOrderStatus(req.params.id, status);
  res.json(result);
});

// Admin Order Delete
app.delete(['/api/orders/:id', '/orders/:id'], protect, (req, res) => {
  const result = storage.deleteOrder(req.params.id);
  res.json(result);
});

// 6. Admin Analytics
app.get(['/api/orders/analytics', '/orders/analytics'], protect, (req, res) => {
  const analytics = storage.getAnalytics();
  res.json({ success: true, analytics });
});

// 7. Store Settings & Hero Endpoints
app.get(['/api/settings/public', '/settings/public'], (req, res) => {
  const data = storage.getSiteData();
  res.json({ success: true, settings: data.storeSettings });
});

app.get(['/api/hero/public', '/hero/public'], (req, res) => {
  const data = storage.getSiteData();
  res.json({ success: true, hero: data.hero });
});

// 8. Admin Authentication
app.post(['/api/auth/login', '/auth/login'], authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।' });
  }

  const admin = storage.getAdmin();
  if (username !== admin.username) {
    return res.status(401).json({ success: false, message: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।' });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।' });
  }

  const token = jwt.sign(
    { username: admin.username, role: admin.role || 'admin' },
    JWT_SECRET,
    { expiresIn: '3d' }
  );

  res.json({
    success: true,
    token,
    admin: { username: admin.username, role: admin.role || 'admin' },
  });
});

app.get(['/api/auth/me', '/auth/me'], protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

app.post(['/api/auth/password', '/auth/password'], protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'সকল ফিল্ড পূরণ করুন।' });
  }

  const admin = storage.getAdmin();
  const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);
  storage.updateAdminPassword(newHash);

  res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
});

// 9. Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    mode: 'realtime-site-data',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 10. 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Start Server (standalone / local mode) ───────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Real-time Site-Data Server running on http://localhost:${PORT}`);
    console.log(`⚡ API: http://localhost:${PORT}/api/site-data`);
    console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
