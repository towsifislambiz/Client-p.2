const mongoose = require('mongoose');

const colorVariationSchema = new mongoose.Schema(
  {
    color: { type: String, required: true },
    colorCode: { type: String, default: '#cc0000' },
    colorCode2: { type: String },
    image: { type: String },
    stock: { type: Number, default: 10, min: 0 },
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    banglaName: { type: String, trim: true },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: { type: Number, min: 0 },
    description: { type: String, default: '' },
    itemsList: { type: String, default: '' },
    category: { type: String, default: 'Combo' },
    image: { type: String, default: '' },
    color: { type: String, default: '' },
    colorCode: { type: String, default: '#cc0000' },
    colorCode2: { type: String },
    tags: [{ type: String }],
    stock: { type: Number, default: 10, min: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    colorVariations: [colorVariationSchema],
    // Legacy fields preserved for compatibility
    badge: { type: String },
    badgeColor: { type: String },
    discount: { type: Number },
  },
  { timestamps: true }
);

// Auto-update inStock when stock changes
productSchema.pre('save', function () {
  this.inStock = this.stock > 0;
});

module.exports = mongoose.model('Product', productSchema);
