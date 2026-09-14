const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'GIFT VIBES' },
    storeTagline: { type: String, default: 'Gifts That Create Memories' },
    whatsappNumber: { type: String, default: '8801828739540' },
    phone: { type: String, default: '01828739540' },
    email: { type: String, default: 'rabbanimeheraj03@gmail.com' },
    address: { type: String, default: '148, Arambag, Motijheel, Dhaka-1000' },
    bkashNumber: { type: String, default: '01828739540 (Personal)' },
    nagadNumber: { type: String, default: '01828739540 (Personal)' },
    deliveryInsideDhaka: { type: Number, default: 80 },
    deliveryOutsideDhaka: { type: Number, default: 130 },
    deliveryTime: { type: String, default: '১ - ৩ দিন' },
    // Only one settings document should exist
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
