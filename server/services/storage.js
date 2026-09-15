const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const DATA_FILE = path.join(__dirname, '../data/siteData.json');
const TMP_FILE = path.join(os.tmpdir(), 'siteData.json');

const PRODUCTS_IMG_DIR = path.join(__dirname, '../../public/images/products');
const PRODUCTS_IMG_DIST_DIR = path.join(__dirname, '../../dist/images/products');
const IMAGES_DIR = path.join(__dirname, '../../public/images');
const IMAGES_DIST_DIR = path.join(__dirname, '../../dist/images');

// Automatic WebP Conversion Pipeline
async function processImageToWebP(imageData, prefix = 'product') {
  if (!imageData || typeof imageData !== 'string') return imageData;

  // Case 1: Base64 data URI (from file picker or canvas conversion)
  if (imageData.startsWith('data:image/')) {
    try {
      const parts = imageData.split(';base64,');
      if (parts.length === 2) {
        const buffer = Buffer.from(parts[1], 'base64');
        const filename = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;

        const isGeneral = prefix.startsWith('logo') || prefix.startsWith('hero');
        const targetDir = isGeneral ? IMAGES_DIR : PRODUCTS_IMG_DIR;
        const distDir = isGeneral ? IMAGES_DIST_DIR : PRODUCTS_IMG_DIST_DIR;

        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const webpBuffer = await sharp(buffer)
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        fs.writeFileSync(path.join(targetDir, filename), webpBuffer);

        if (fs.existsSync(path.dirname(distDir))) {
          if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
          fs.writeFileSync(path.join(distDir, filename), webpBuffer);
        }

        return isGeneral ? `/images/${filename}` : `/images/products/${filename}`;
      }
    } catch (err) {
      console.error('Failed to convert base64 image to WebP:', err.message);
    }
  }

  // Case 2: Local file path with non-webp extension (.png, .jpg, .jpeg)
  const nonWebpMatch = imageData.match(/\.(png|jpe?g|gif|bmp|tiff)$/i);
  if (nonWebpMatch) {
    const webpUrl = imageData.replace(/\.(png|jpe?g|gif|bmp|tiff)$/i, '.webp');
    const cleanRel = imageData.startsWith('/') ? imageData.slice(1) : imageData;
    const publicPath = path.join(__dirname, '../../public', cleanRel);
    const webpPublicPath = publicPath.replace(/\.(png|jpe?g|gif|bmp|tiff)$/i, '.webp');

    if (fs.existsSync(webpPublicPath)) {
      return webpUrl;
    }

    if (fs.existsSync(publicPath)) {
      try {
        await sharp(publicPath).webp({ quality: 85 }).toFile(webpPublicPath);
        const distPath = path.join(__dirname, '../../dist', cleanRel).replace(/\.(png|jpe?g|gif|bmp|tiff)$/i, '.webp');
        if (fs.existsSync(path.dirname(distPath))) {
          fs.copyFileSync(webpPublicPath, distPath);
        }
        return webpUrl;
      } catch (e) {
        console.error('Failed converting file to webp:', e.message);
      }
    }
  }

  return imageData;
}

// In-memory cache for ultra-fast (sub-millisecond) reads
let cachedData = null;

// Load data from disk (DATA_FILE is authoritative; TMP_FILE is serverless fallback)
function loadData() {
  try {
    // 1. Check primary siteData.json file
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      cachedData = JSON.parse(raw);
      return cachedData;
    }
    // 2. Fallback to tmp copy for serverless read-only environments
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      cachedData = JSON.parse(raw);
      return cachedData;
    }
  } catch (err) {
    console.error('Failed to load siteData.json:', err.message);
  }

  if (cachedData) {
    if (!cachedData.admin || !cachedData.admin.passwordHash) {
      cachedData.admin = {
        username: 'Rabbani12',
        passwordHash: '$2b$10$pjDjcSQ9fzWUBZbMEfAUFeQfP8VytPNPZ/tfxgKSEvYuKn6Tnrw62',
        role: 'admin',
      };
      saveData();
    }
    return cachedData;
  }

  // Fallback initial state if file is not found
  cachedData = {
    updatedAt: new Date().toISOString(),
    storeSettings: {
      storeName: 'GIFT VIBES',
      storeTagline: 'Gifts That Create Memories',
      whatsappNumber: '8801828739540',
      phone: '01828739540',
      email: 'rabbanimeheraj03@gmail.com',
      address: '148, Arambag, Motijheel, Dhaka- 1000',
      bkashNumber: '01828739540 (Personal)',
      nagadNumber: '01828739540 (Personal)',
      deliveryCharges: { insideDhaka: 80, outsideDhaka: 130 },
      deliveryTime: '১ - ৩ দিন',
    },
    hero: {
      badge: '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কালেকশন',
      headlineMain: 'তাঁতে বোনা সুতির শাড়ি কম্বো গিফট সেট',
      headlineSub: 'প্রিয় মানুষের মুখে হাসি ফোটানোর সম্পূর্ণ ১১-ইন-১ রাজকীয় উপহার প্যাকেজ',
      offerText: 'সীমিত সময়ের জন্য ১৮% বিশেষ মূল্যছাড়!',
      ctaText: 'পছন্দের কম্বো অর্ডার করুন',
    },
    products: [],
    orders: [],
    admin: {
      username: 'Rabbani12',
      passwordHash: '$2b$10$pjDjcSQ9fzWUBZbMEfAUFeQfP8VytPNPZ/tfxgKSEvYuKn6Tnrw62',
      role: 'admin',
    },
  };
  saveData();
  return cachedData;
}

// Persist in-memory cache to disk
function saveData() {
  cachedData.updatedAt = new Date().toISOString();
  const jsonString = JSON.stringify(cachedData, null, 2);

  // Try saving to project data file first (works locally and where disk is writable)
  let saved = false;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, jsonString, 'utf8');
    saved = true;
  } catch (err) {
    // Expected on read-only environments like Vercel
  }

  // Also write to os.tmpdir() for serverless runtimes
  try {
    fs.writeFileSync(TMP_FILE, jsonString, 'utf8');
    saved = true;
  } catch (err) {
    // ignore
  }

  return saved;
}

// Initialize cache on module load
loadData();

module.exports = {
  // Return the complete public site data for storefront & admin
  getSiteData() {
    if (!cachedData) loadData();
    return {
      success: true,
      updatedAt: cachedData.updatedAt,
      storeSettings: cachedData.storeSettings,
      hero: cachedData.hero,
      products: cachedData.products,
      orders: cachedData.orders || [],
    };
  },

  // Update specific sections (storeSettings, hero, products, etc.)
  async updateSiteData(updates = {}) {
    if (!cachedData) loadData();

    if (updates.storeSettings) {
      if (updates.storeSettings.logo) {
        updates.storeSettings.logo = await processImageToWebP(updates.storeSettings.logo, 'logo');
      }
      if (updates.storeSettings.logoIcon) {
        updates.storeSettings.logoIcon = await processImageToWebP(updates.storeSettings.logoIcon, 'logo-icon');
      }
      cachedData.storeSettings = { ...cachedData.storeSettings, ...updates.storeSettings };
    }
    if (updates.hero) {
      if (updates.hero.bannerImage && updates.hero.bannerImage.startsWith('data:image/')) {
        updates.hero.bannerImage = await processImageToWebP(updates.hero.bannerImage, 'hero-banner');
      }
      cachedData.hero = { ...cachedData.hero, ...updates.hero };
    }
    if (Array.isArray(updates.products)) {
      for (const prod of updates.products) {
        if (prod.image) {
          const slug = (prod.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'item';
          prod.image = await processImageToWebP(prod.image, `product-${slug}`);
        }
      }
      cachedData.products = updates.products;
    }

    saveData();
    return {
      success: true,
      updatedAt: cachedData.updatedAt,
      storeSettings: cachedData.storeSettings,
      hero: cachedData.hero,
      products: cachedData.products,
    };
  },

  // Quick stock update for a single product (Supports exact 0, increments, instant save)
  updateProductStock(productId, newStock) {
    if (!cachedData) loadData();
    const stockNum = Math.max(0, typeof newStock === 'number' ? newStock : Number(newStock) || 0);
    const prod = cachedData.products.find((p) => String(p.id) === String(productId));
    if (prod) {
      prod.stock = stockNum;
      prod.inStock = stockNum > 0;
      saveData();
      return { success: true, product: prod, updatedAt: cachedData.updatedAt };
    }
    return { success: false, message: 'Product not found' };
  },

  // Save or update a product (Preserves all fields, WebP auto-conversion, 50-limit enforcement)
  async saveProduct(productData) {
    if (!cachedData) loadData();
    const id = productData.id ? (typeof productData.id === 'number' ? productData.id : Number(productData.id) || productData.id) : Date.now();
    const index = cachedData.products.findIndex((p) => String(p.id) === String(id));

    // Enforce 50 product package limit for new products
    if (index === -1 && (cachedData.products || []).length >= 50) {
      return {
        success: false,
        message: '⚠️ সর্বোচ্চ ৫০টি পণ্যের লিমিট পূর্ণ হয়েছে! নতুন পণ্য যোগ করতে হলে যেকোনো একটি পণ্য ডিলিট করুন।',
      };
    }

    let finalImage = productData.image;
    if (finalImage) {
      const slug = (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30) || 'item';
      finalImage = await processImageToWebP(finalImage, `product-${slug}`);
    }

    const existingProduct = index > -1 ? cachedData.products[index] : {};

    // Robust number parsing (preserving 0)
    const stockNum = typeof productData.stock !== 'undefined' && productData.stock !== null && productData.stock !== ''
      ? Math.max(0, Number(productData.stock))
      : (typeof existingProduct.stock === 'number' ? existingProduct.stock : 10);

    const priceNum = typeof productData.price !== 'undefined' && productData.price !== null && productData.price !== ''
      ? Number(productData.price)
      : (typeof existingProduct.price === 'number' ? existingProduct.price : 1350);

    const originalPriceNum = typeof productData.originalPrice !== 'undefined' && productData.originalPrice !== null && productData.originalPrice !== ''
      ? Number(productData.originalPrice)
      : (typeof existingProduct.originalPrice === 'number' ? existingProduct.originalPrice : 1650);

    const inStockVal = typeof productData.inStock === 'boolean'
      ? productData.inStock
      : (productData.inStock === 'false' ? false : (productData.inStock === 'true' ? true : stockNum > 0));

    // Auto-calculate discount if not explicitly provided
    let discount = productData.discount;
    if (!discount && originalPriceNum > priceNum) {
      const pct = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
      discount = `${pct}% অফ`;
    }

    const updatedProduct = {
      ...existingProduct,
      ...productData,
      id,
      name: productData.name || existingProduct.name || 'Handloom Cotton Saree Combo',
      banglaName: productData.banglaName || existingProduct.banglaName || 'তাঁতের শাড়ি কম্বো',
      tagline: typeof productData.tagline !== 'undefined' ? productData.tagline : (existingProduct.tagline || ''),
      price: priceNum,
      originalPrice: originalPriceNum,
      stock: stockNum,
      inStock: inStockVal,
      discount: discount || existingProduct.discount || '',
      category: productData.category || existingProduct.category || 'Handloom',
      color: productData.color || existingProduct.color || 'Multi',
      colorCode: productData.colorCode || existingProduct.colorCode || '#880808',
      description: typeof productData.description !== 'undefined' ? productData.description : (existingProduct.description || ''),
      itemsList: typeof productData.itemsList !== 'undefined' ? productData.itemsList : (existingProduct.itemsList || ''),
      image: finalImage || existingProduct.image || '/images/products/red-maroon.webp',
      rating: existingProduct.rating || 5,
      reviewsCount: existingProduct.reviewsCount || Math.floor(25 + Math.random() * 30),
      tags: Array.isArray(productData.tags) ? productData.tags : (existingProduct.tags || ['saree', 'combo', 'gift']),
    };

    if (index > -1) {
      cachedData.products[index] = updatedProduct;
    } else {
      cachedData.products.unshift(updatedProduct);
    }

    saveData();
    return { success: true, product: updatedProduct, updatedAt: cachedData.updatedAt };
  },

  // Delete a product
  deleteProduct(productId) {
    if (!cachedData) loadData();
    cachedData.products = cachedData.products.filter((p) => String(p.id) !== String(productId));
    saveData();
    return { success: true, updatedAt: cachedData.updatedAt };
  },

  // Add new customer order & automatically deduct stock
  addOrder(orderData) {
    if (!cachedData) loadData();

    const orderId = orderData.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Calculate subtotal from items if missing
    const calculatedSubtotal = Array.isArray(orderData.items)
      ? orderData.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      : 0;
    const subtotal = typeof orderData.subtotal === 'number' && orderData.subtotal > 0
      ? orderData.subtotal
      : calculatedSubtotal;

    // Calculate delivery charge according to customer district
    const isInsideDhaka = (orderData.customer?.district || 'insideDhaka') === 'insideDhaka';
    const defaultDeliveryFee = isInsideDhaka
      ? (cachedData.storeSettings?.deliveryCharges?.insideDhaka ?? 80)
      : (cachedData.storeSettings?.deliveryCharges?.outsideDhaka ?? 130);
    const deliveryFee = typeof orderData.deliveryFee === 'number'
      ? orderData.deliveryFee
      : defaultDeliveryFee;

    const grandTotal = typeof orderData.grandTotal === 'number' && orderData.grandTotal > 0
      ? orderData.grandTotal
      : (subtotal + deliveryFee);

    const newOrder = {
      ...orderData,
      id: orderId,
      subtotal,
      deliveryFee,
      grandTotal,
      status: orderData.status || 'Pending',
      date: orderData.date || new Date().toLocaleString('bn-BD'),
      timestamp: orderData.timestamp || Date.now(),
    };

    // Deduct stock for ordered products
    if (Array.isArray(orderData.items)) {
      orderData.items.forEach((item) => {
        const prod = cachedData.products.find((p) => String(p.id) === String(item.id || item.productId));
        if (prod) {
          const qty = Number(item.quantity) || 1;
          prod.stock = Math.max(0, (prod.stock || 10) - qty);
          prod.inStock = prod.stock > 0;
        }
      });
    }

    cachedData.orders = [newOrder, ...(cachedData.orders || [])];
    saveData();

    return {
      success: true,
      order: newOrder,
      updatedAt: cachedData.updatedAt,
      products: cachedData.products,
    };
  },

  // Update status of an existing order
  updateOrderStatus(orderId, newStatus) {
    if (!cachedData) loadData();
    const order = (cachedData.orders || []).find((o) => String(o.id) === String(orderId));
    if (order) {
      order.status = newStatus;
      saveData();
      return { success: true, order, updatedAt: cachedData.updatedAt };
    }
    return { success: false, message: 'Order not found' };
  },

  // Delete an order
  deleteOrder(orderId) {
    if (!cachedData) loadData();
    cachedData.orders = (cachedData.orders || []).filter((o) => String(o.id) !== String(orderId));
    saveData();
    return { success: true, updatedAt: cachedData.updatedAt };
  },

  // Get admin credentials for login
  getAdmin() {
    if (!cachedData) loadData();
    return cachedData.admin;
  },

  // Update admin password
  updateAdminPassword(newPasswordHash) {
    if (!cachedData) loadData();
    cachedData.admin.passwordHash = newPasswordHash;
    saveData();
    return { success: true };
  },

  // Analytics helper
  getAnalytics() {
    if (!cachedData) loadData();
    const orders = cachedData.orders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length;
    const deliveredOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      productsCount: cachedData.products.length,
    };
  },

  // Image processing helper
  processImageToWebP,
};
