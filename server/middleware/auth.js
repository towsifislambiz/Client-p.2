const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'অনুমোদন নেই। লগইন করুন।' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await AdminUser.findById(decoded.id).select('-password');
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'অ্যাডমিন ইউজার পাওয়া যায়নি।' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'টোকেন মেয়াদ উত্তীর্ণ বা অবৈধ। পুনরায় লগইন করুন।' });
  }
};

module.exports = { protect };
