require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');

// Validate required env vars
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.warn(`⚠️ Warning: Missing required environment variables: ${missing.join(', ')}`);
}

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to load cross-origin
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('loca.lt')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Generous limit for testing
  message: { success: false, message: 'অনেক বেশি লগইন চেষ্টা। ১৫ মিনিট পর আবার চেষ্টা করুন।' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Static Files (product images served from client/public) ──────────────────
app.use('/images', express.static(path.join(__dirname, '../public/images')));

const mongoose = require('mongoose');

// ─── DB Auto-Connect Middleware for Serverless ────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (_err) {
    // handled in readiness check
  }
  next();
});

// ─── DB Readiness Middleware ──────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  if (
    req.path === '/health' ||
    req.path === '/settings/public' ||
    req.path === '/hero/public' ||
    (req.method === 'GET' && req.path === '/products')
  ) {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'ডেটাবেজ কানেক্ট হয়নি। দয়া করে server/.env ফাইলে MongoDB Atlas URI যুক্ত করুন।',
    });
  }
  next();
});


// ─── API Routes (handles both /api/* and direct routes) ────────────────────────
app.use(['/api/auth', '/auth'], require('./routes/auth'));
app.use(['/api/products', '/products'], require('./routes/products'));
app.use(['/api/orders', '/orders'], require('./routes/orders'));
app.use(['/api/settings', '/settings'], require('./routes/settings'));
app.use(['/api/hero', '/hero'], require('./routes/hero'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState,
    dbError: global.lastDbError || null,
    hasMongoUri: Boolean(process.env.MONGODB_URI),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server (standalone / local mode) ───────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Gift Vibes Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
