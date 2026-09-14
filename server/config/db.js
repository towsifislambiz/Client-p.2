const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('YOUR_MONGODB_ATLAS_URI_HERE') || !uri.startsWith('mongodb')) {
    console.warn('\n⚠️  [MONGODB WARNING] MONGODB_URI is not set or still has the placeholder in server/.env');
    console.warn('👉 Please set your MongoDB Atlas connection string in: C:\\Users\\Shohan17\\Desktop\\Client-p.2\\server\\.env\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'giftvibes',
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;

