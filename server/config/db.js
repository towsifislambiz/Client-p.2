const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('YOUR_MONGODB_ATLAS_URI_HERE') || !uri.startsWith('mongodb')) {
    console.warn('⚠️ [MONGODB WARNING] MONGODB_URI is not set or invalid.');
    return false;
  }

  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  if (cached.conn) {
    return true;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: 'giftvibes',
        serverSelectionTimeoutMS: 8000,
      })
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
    return true;
  } catch (error) {
    cached.promise = null;
    global.lastDbError = error.message;
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;

