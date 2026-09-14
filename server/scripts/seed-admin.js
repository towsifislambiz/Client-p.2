require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'giftvibes',
    });
    console.log('✅ Connected to MongoDB');

    const username = process.env.ADMIN_USERNAME || 'Rabbani12';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error('❌ ADMIN_PASSWORD not set in .env');
      process.exit(1);
    }

    const existing = await AdminUser.findOne({ username });
    if (existing) {
      console.log(`ℹ️  Admin user "${username}" already exists. Skipping seed.`);
      console.log('   To reset password, use the /admin/security page or delete the user manually.');
      process.exit(0);
    }

    await AdminUser.create({ username, password });
    console.log(`✅ Admin user created: "${username}"`);
    console.log('⚠️  Remove ADMIN_PASSWORD from .env after seeding for security.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
