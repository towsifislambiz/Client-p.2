// Automated Verification Suite for Gift Vibes Store
require('dotenv').config();
const http = require('http');

const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting End-to-End Backend Verification...\n');
  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert('Health Check Endpoint', health.status === 200 && health.data.status === 'ok');

    // 2. Public Settings
    const settings = await request('GET', '/api/settings/public');
    assert('Public Settings API', settings.status === 200 && settings.data.success && settings.data.settings.storeName === 'GIFT VIBES');

    // 3. Public Hero CMS
    const hero = await request('GET', '/api/hero/public');
    assert('Public Hero CMS API', hero.status === 200 && hero.data.success && Boolean(hero.data.hero.headlineMain));

    // 4. Public Products Listing from MongoDB
    const products = await request('GET', '/api/products');
    assert('Public Products API', products.status === 200 && products.data.success && Array.isArray(products.data.products) && products.data.products.length >= 11, `Found: ${products.data.products?.length} products`);

    // 5. Invalid Product ID handling
    const invalidProd = await request('GET', '/api/products/invalid_id_12345');
    assert('Invalid Product ID returns 404', invalidProd.status === 404 && invalidProd.data.success === false);

    // 6. Admin Authentication Login
    const login = await request('POST', '/api/auth/login', {
      username: process.env.ADMIN_USERNAME || 'Rabbani12',
      password: process.env.ADMIN_PASSWORD || 'test_password',
    });
    assert('Admin Login with JWT', login.status === 200 && login.data.success && Boolean(login.data.token));
    const token = login.data.token;

    // 7. Protected /api/auth/me with Token
    const me = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${token}` });
    assert('Protected /api/auth/me with Bearer Token', me.status === 200 && me.data.admin?.username === 'Rabbani12');

    // 8. Protected route without Token
    const meNoAuth = await request('GET', '/api/auth/me');
    assert('Protected Route rejects unauthenticated', meNoAuth.status === 401 && meNoAuth.data.success === false);

    // 9. Order Creation with Server Price Calculation
    const firstProduct = products.data.products[0];
    const orderPayload = {
      customer: {
        name: 'টেস্ট কাস্টমার',
        phone: '01711223344',
        address: 'মতিঝিল, ঢাকা',
        district: 'insideDhaka',
        paymentMethod: 'COD',
      },
      items: [
        {
          productId: firstProduct._id,
          name: firstProduct.name,
          price: 1, // Attempted spoof price - server must recalculate
          quantity: 1,
        },
      ],
    };
    const orderRes = await request('POST', '/api/orders', orderPayload);
    const expectedTotal = firstProduct.price + 80; // product price + insideDhaka delivery
    assert(
      'Order Creation & Server-side Price Verification',
      orderRes.status === 201 && orderRes.data.success && orderRes.data.order.grandTotal === expectedTotal,
      `Calculated grandTotal: ${orderRes.data.order?.grandTotal}, Expected: ${expectedTotal}`
    );

    // 10. Admin Orders Listing
    const adminOrders = await request('GET', '/api/orders', null, { Authorization: `Bearer ${token}` });
    assert('Admin Orders API with Pagination', adminOrders.status === 200 && adminOrders.data.success && adminOrders.data.orders?.length > 0);

    // 11. Admin Orders Revenue Analytics
    const analytics = await request('GET', '/api/orders/analytics', null, { Authorization: `Bearer ${token}` });
    assert('Admin Revenue Analytics', analytics.status === 200 && analytics.data.success && typeof analytics.data.analytics.totalRevenue === 'number');

    // 12. Product Creation & Deletion
    const newProd = await request(
      'POST',
      '/api/products',
      {
        name: 'Test Combo Saree',
        banglaName: 'টেস্ট কম্বো শাড়ি',
        price: 1200,
        color: 'Gold',
        stock: 5,
      },
      { Authorization: `Bearer ${token}` }
    );
    assert('Admin Product Creation', newProd.status === 201 && newProd.data.success && Boolean(newProd.data.product?._id));

    if (newProd.data.product?._id) {
      const delRes = await request('DELETE', `/api/products/${newProd.data.product._id}`, null, {
        Authorization: `Bearer ${token}`,
      });
      assert('Admin Product Deletion', delRes.status === 200 && delRes.data.success);
    }

    console.log(`\n========================================`);
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log('🎉 ALL BACKEND AND DATABASE SYSTEMS 100% OPERATIONAL!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();
