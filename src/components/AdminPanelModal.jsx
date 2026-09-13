import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Package, ShoppingBag, Trash2, CheckCircle2, Lock, RotateCcw, AlertTriangle, Upload, Image as ImageIcon, KeyRound, ShieldAlert, LogOut, Bell } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export default function AdminPanelModal({ isOpen, onClose, products, onAddProduct, onDeleteProduct, onResetProducts, onUpdateStock }) {
  if (!isOpen) return null;

  // Authentication State (Default PIN: 1234)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('giftvibes_admin_auth') === 'true';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders'
  const [orders, setOrders] = useState([]);
  const [limitError, setLimitError] = useState('');

  const MAX_PRODUCT_LIMIT = 50;
  const DEFAULT_PIN = '1234';

  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Red & Maroon',
    color: '',
    price: '1350',
    originalPrice: '1650',
    stock: '10',
    discount: '১৮% অফ',
    image: '',
    description: '',
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('giftvibes_store_orders') || '[]');
    setOrders(savedOrders);
  }, [isOpen]);

  // Handle Admin PIN Authentication
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError('');

    const savedPin = localStorage.getItem('aura_admin_pin') || DEFAULT_PIN;

    if (pinInput === savedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_auth', 'true');
      setPinInput('');
    } else {
      setPinError('⚠️ ভুল সিকিউরিটি পিন! পিন কোড মনে না থাকলে ডিফল্ট পিন (1234) ট্রাই করুন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_admin_auth');
  };

  const handleTestNotification = () => {
    const testOrder = {
      id: 'ORD-TEST-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString('bn-BD'),
      timestamp: Date.now(),
      isRealTime: true,
      customer: {
        name: 'মোঃ তানভীর আহমেদ',
        address: 'মিরপুর ১০, ঢাকা',
        district: 'insideDhaka',
        phone: '01828739540',
        paymentMethod: 'ক্যাশ অন ডেলিভারি'
      },
      items: [{
        id: 1,
        name: 'Premium Saree Combo (Red + Maroon)',
        banglaName: 'রেড ও মেরুন কম্বো শাড়ি',
        selectedColor: 'Red + Maroon',
        price: 1350,
        quantity: 1,
        image: '/images/products/red-maroon.png'
      }],
      grandTotal: 1430
    };

    window.dispatchEvent(new CustomEvent('giftvibes_new_order', { detail: testOrder }));
  };

  const handleClearOrders = () => {
    if (window.confirm('আপনি কি সত্যিই সকল অর্ডারের রেকর্ড মুছে ফেলতে চান?')) {
      localStorage.removeItem('giftvibes_store_orders');
      setOrders([]);
    }
  };

  // File Upload Handler (PC File Manager / Phone Gallery)
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setImagePreview(base64Image);
        setNewProd((prev) => ({ ...prev, image: base64Image }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    setLimitError('');

    if (products.length >= MAX_PRODUCT_LIMIT) {
      setLimitError(`⚠️ ৫০টি প্রোডাক্টের সর্বোচ্চ লিমিট পূর্ণ হয়েছে! নতুন প্রোডাক্ট যোগ করার আগে একটি পুরনো প্রোডাক্ট ডিলিট করুন।`);
      return;
    }

    if (!newProd.name || !newProd.price) return;

    const stockCount = newProd.stock !== '' ? Math.max(0, parseInt(newProd.stock, 10)) : 10;

    const created = {
      id: Date.now(),
      name: newProd.name,
      banglaName: newProd.name,
      category: newProd.category,
      color: newProd.color || 'স্পেশাল কম্বো',
      price: Number(newProd.price),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : null,
      stock: stockCount,
      inStock: stockCount > 0,
      discount: newProd.discount || '১৮% অফ',
      rating: 5.0,
      reviewsCount: 1,
      image: newProd.image || imagePreview || '/images/products/red-maroon.png',
      description: newProd.description || 'একটি প্রিমিয়াম সফট শাড়ি, ম্যাচিং চুড়ি ও কুন্দন জুয়েলারি গিফট কম্বো।',
      itemsList: 'শাড়ি • চুড়ি • নেকলেস • দুল • মালা • টিপ • কার্ড',
      tags: [newProd.name.toLowerCase(), newProd.category.toLowerCase(), 'saree', 'combo', 'gift', 'শাড়ি'],
    };

    onAddProduct(created);
    setNewProd({
      name: '',
      category: 'Red & Maroon',
      color: '',
      price: '1350',
      originalPrice: '1650',
      stock: '10',
      discount: '১৮% অফ',
      image: '',
      description: '',
    });
    setImagePreview('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm font-sans">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Locked Screen: Enter Security PIN */}
          {!isAuthenticated ? (
            <div className="text-center py-10 max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">এডমিন সিকিউরিটি লক</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  এটি শুধুমাত্র দোকান মালিকের জন্য সংরক্ষিত। এডমিন প্যানেলে ঢুকতে সিকিউরিটি পিন দিন।
                </p>
              </div>

              {pinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-mono font-bold">
                  {pinError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="সিকিউরিটি পিন (ডিফল্ট: 1234)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-center text-sm font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  আনলক করুন (Unlock Admin) 🔓
                </button>
              </form>

              <div className="pt-2 text-[11px] font-mono text-slate-400">
                💡 ডিফল্ট সিকিউরিটি পিন: <span className="font-bold text-slate-700">1234</span>
              </div>
            </div>
          ) : (
            /* Authenticated Admin Dashboard Screen */
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>ম্যানেজমেন্ট এডমিন ড্যাশবোর্ড</span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">● আনলকড</span>
                    </h2>
                    <span className="text-[10px] font-mono text-slate-400 block">৫০টি লিমিট রিয়েলটাইম প্রোডাক্ট ও ফাইল ম্যানেজমেন্ট</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="mr-8 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="লগআউট"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      activeTab === 'products' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    প্রোডাক্ট ম্যানেজমেন্ট ({products.length} / {MAX_PRODUCT_LIMIT})
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      activeTab === 'orders' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    কাস্টমার অর্ডার্স ({orders.length})
                  </button>
                </div>

                <button
                  onClick={onResetProducts}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  title="ডেমো ডেটা রিসেট করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">রিসেট ডেটা</span>
                </button>
              </div>

              {/* Tab 1: Products Management */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* Limit Error Banner */}
                  {limitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-mono font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{limitError}</span>
                    </div>
                  )}

                  {/* Form to Add New Product */}
                  <form onSubmit={handleCreateProduct} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <Plus className="w-4 h-4 text-orange-600" /> নতুন প্রোডাক্ট যোগ করুন:
                      </h3>
                      <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        লিমিট: {products.length} / {MAX_PRODUCT_LIMIT} টি
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">প্রোডাক্টের নাম: *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: রক্তিম লাল ও মেরুন শাড়ি কম্বো"
                          value={newProd.name}
                          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-sans font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                        <select
                          value={newProd.category}
                          onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        >
                          <option value="Red & Maroon">রক্তিম লাল ও মেরুন</option>
                          <option value="White & Classic">শুভ্র সাদা কালেকশন</option>
                          <option value="Blue & Royal">অভিজাত রয়্যাল ব্লু</option>
                          <option value="Pink & Purple">রানি পিঙ্ক ও পার্পল</option>
                          <option value="Black & Vibrant">ব্ল্যাক ও ভাইব্রেন্ট</option>
                          <option value="Gift Combo">অন্যান্য গিফট কম্বো</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">বিক্রয় মূল্য (BDT ৳): *</label>
                        <input
                          type="number"
                          required
                          placeholder="১৩৫০"
                          value={newProd.price}
                          onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">আসল মূল্য (Original ৳):</label>
                        <input
                          type="number"
                          placeholder="১৬৫০"
                          value={newProd.originalPrice}
                          onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 mb-1">
                          📦 স্টক সংখ্যা (Stock Quantity): *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="১০"
                          value={newProd.stock}
                          onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">কালার/ভ্যারিয়েশন নাম:</label>
                        <input
                          type="text"
                          placeholder="যেমন: Red + Maroon"
                          value={newProd.color}
                          onChange={(e) => setNewProd({ ...newProd, color: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-sans font-medium"
                        />
                      </div>
                    </div>

                    {/* Dual Image Upload Selector (File Upload vs URL) */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                        প্রোডাক্টের ছবি সিলেক্ট করুন (মোবাইল গ্যালারি / পিসি ফাইল):
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Device File Manager / Gallery Input */}
                        <label className="w-full sm:w-auto px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0">
                          <Upload className="w-4 h-4" />
                          <span>গ্যালারি / পিসি থেকে ছবি বেছে নিন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        <span className="text-[10px] text-slate-400 font-bold">অথবা</span>

                        {/* Image URL Input */}
                        <input
                          type="text"
                          placeholder="ছবি লিংক বসালেও হবে (Optional Image URL)"
                          value={newProd.image}
                          onChange={(e) => {
                            setNewProd({ ...newProd, image: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      {/* Live Image Preview Thumbnail */}
                      {imagePreview && (
                        <div className="pt-2 flex items-center gap-3">
                          <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-300" />
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ছবি সিলেক্টেড হয়েছে!
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={products.length >= MAX_PRODUCT_LIMIT}
                      className={`w-full py-2.5 font-bold rounded-xl shadow-xs transition-all ${
                        products.length >= MAX_PRODUCT_LIMIT
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                      }`}
                    >
                      {products.length >= MAX_PRODUCT_LIMIT ? '৫০টি প্রোডাক্টের লিমিট পূর্ণ হয়েছে' : 'প্রোডাক্ট পাবলিশ করুন (পছন্দের ডেটাবেজ সেভ) 🚀'}
                    </button>
                  </form>

                  {/* Product List */}
                  <div className="space-y-2 font-mono text-xs">
                    <h4 className="font-bold text-slate-900">বর্তমান প্রোডাক্টস ও স্টক তালিকা ({products.length}টি):</h4>
                    {products.map((p) => {
                      const pStock = typeof p.stock === 'number' ? p.stock : (p.inStock === false ? 0 : 10);
                      const isSold = pStock <= 0 || p.inStock === false;

                      return (
                        <div key={p.id} className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${isSold ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={p.image} alt={p.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 truncate max-w-xs">{p.banglaName || p.name}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-amber-700 font-bold">৳{p.price.toLocaleString()}</span>
                                <span className="text-slate-300">•</span>
                                {isSold ? (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                                    স্টক শেষ (Sold Out)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    স্টক: {pStock}টি
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Stock Quick Adjustment */}
                            {onUpdateStock && (
                              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => onUpdateStock(p.id, Math.max(0, pStock - 1))}
                                  className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-black text-xs cursor-pointer border-r border-slate-200"
                                  title="স্টক ১ কমান"
                                >
                                  -
                                </button>
                                <span className="px-2.5 text-xs font-bold text-slate-800 min-w-[28px] text-center">{pStock}</span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateStock(p.id, pStock + 1)}
                                  className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-black text-xs cursor-pointer border-l border-slate-200"
                                  title="স্টক ১ বাড়ান"
                                >
                                  +
                                </button>
                              </div>
                            )}

                            {/* Delete Product */}
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold transition-colors"
                              title="প্রোডাক্ট মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">ডিলিট</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Tab 2: Orders History */}
              {activeTab === 'orders' && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Top Actions Bar for Orders */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>রিয়েল-টাইম কাস্টমার অর্ডার তালিকা ({orders.length}টি)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        title="রিয়েল-টাইম পপআপ টেস্ট করুন"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>নোটিফিকেশন টেস্ট</span>
                      </button>

                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearOrders}
                          className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="সকল অর্ডার ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ডাটা ক্লিয়ার</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                      এখনো কোনো অর্ডারের ডাটা জমা হয়নি। ওয়েবসাইট বা হোয়াটসঅ্যাপে কোনো কাস্টমার অর্ডার করার সাথে সাথে এখানে রিয়েল-টাইমে জমা হবে এবং স্ক্রিনে লাইভ পপআপ দেখাবে।
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div key={ord.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-900">{ord.id}</span>
                          <span className="text-[10px] text-slate-400">{ord.date}</span>
                        </div>

                        <div className="text-slate-700 space-y-1">
                          <p><b>কাস্টমার:</b> {ord.customer?.name} ({ord.customer?.phone})</p>
                          <p><b>ঠিকানা:</b> {ord.customer?.address} {ord.customer?.district === 'insideDhaka' ? '(ঢাকার ভেতরে)' : '(ঢাকার বাইরে)'}</p>
                          <p><b>পেমেন্ট:</b> {ord.customer?.paymentMethod} {ord.customer?.trxId ? `(TrxID: ${ord.customer.trxId})` : ''}</p>
                          {ord.items && ord.items.length > 0 && (
                            <p><b>পণ্য:</b> {ord.items.map((i) => `${i.banglaName || i.name} ${i.selectedColor ? `(${i.selectedColor})` : ''} x${i.quantity || 1}`).join(', ')}</p>
                          )}
                          <p className="text-orange-600 font-bold"><b>সর্বমোট:</b> ৳{ord.grandTotal?.toLocaleString()} BDT</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
