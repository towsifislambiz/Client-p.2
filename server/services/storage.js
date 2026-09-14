const fs = require('fs');
const path = require('path');

const os = require('os');
const DATA_FILE = path.join(__dirname, '../data/siteData.json');
const TMP_FILE = path.join(os.tmpdir(), 'siteData.json');

// In-memory cache for ultra-fast (sub-millisecond) reads
let cachedData = null;

// Load data from disk (tmp fallback or bundle)
function loadData() {
  try {
    // 1. Check if newer tmp copy exists (serverless persistence across warm invocations)
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      cachedData = JSON.parse(raw);
      return cachedData;
    }
    // 2. Check bundled siteData.json
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      cachedData = JSON.parse(raw);
      return cachedData;
    }
  } catch (err) {
    console.error('Failed to load siteData.json:', err.message);
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
      passwordHash: '$2b$10$CH/YrAJzZUMaf9AkuBn27OZg50RhK0RFNOYS81FqI1QrPLrHv/2YK',
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
  updateSiteData(updates = {}) {
    if (!cachedData) loadData();

    if (updates.storeSettings) {
      cachedData.storeSettings = { ...cachedData.storeSettings, ...updates.storeSettings };
    }
    if (updates.hero) {
      cachedData.hero = { ...cachedData.hero, ...updates.hero };
    }
    if (Array.isArray(updates.products)) {
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

  // Quick stock update for a single product
  updateProductStock(productId, newStock) {
    if (!cachedData) loadData();
    const stockNum = Math.max(0, Number(newStock) || 0);
    const prod = cachedData.products.find((p) => String(p.id) === String(productId));
    if (prod) {
      prod.stock = stockNum;
      prod.inStock = stockNum > 0;
      saveData();
      return { success: true, product: prod, updatedAt: cachedData.updatedAt };
    }
    return { success: false, message: 'Product not found' };
  },

  // Save or update a product
  saveProduct(productData) {
    if (!cachedData) loadData();
    const id = productData.id ? Number(productData.id) || productData.id : Date.now();
    const index = cachedData.products.findIndex((p) => String(p.id) === String(id));

    const updatedProduct = {
      ...productData,
      id,
      inStock: Number(productData.stock || 0) > 0,
    };

    if (index > -1) {
      cachedData.products[index] = { ...cachedData.products[index], ...updatedProduct };
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
    const newOrder = {
      ...orderData,
      id: orderId,
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
};
