const jwt = require('jsonwebtoken');
const storage = require('../services/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'giftvibes_super_secret_jwt_key_2026_auth_production_secure_token_64chars';

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'অনুমোদন নেই। অনুগ্রহ করে লগইন করুন।' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = storage.getAdmin();
    if (!admin || admin.username !== decoded.username) {
      return res.status(401).json({ success: false, message: 'অ্যাডমিন ইউজার পাওয়া যায়নি।' });
    }
    req.admin = { username: admin.username, role: admin.role || 'admin' };
    next();
  } catch (_err) {
    return res.status(401).json({ success: false, message: 'টোকেন মেয়াদ উত্তীর্ণ বা অবৈধ। পুনরায় লগইন করুন।' });
  }
};

module.exports = { protect, JWT_SECRET };
