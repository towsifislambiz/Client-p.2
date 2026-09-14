const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    banglaName: { type: String },
    selectedColor: { type: String },
    price: { type: Number, required: true }, // server-verified price
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    },
    customer: {
      name: { type: String, required: [true, 'Customer name required'] },
      phone: { type: String, required: [true, 'Phone number required'] },
      address: { type: String, required: [true, 'Address required'] },
      district: {
        type: String,
        enum: ['insideDhaka', 'outsideDhaka'],
        default: 'insideDhaka',
      },
      paymentMethod: {
        type: String,
        enum: ['COD', 'BKASH'],
        default: 'COD',
      },
      trxId: { type: String, default: '' },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    whatsappSent: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    isRealTime: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for fast queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
