import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Truck, Send, CreditCard, MessageSquare } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export default function CheckoutModal({ isOpen, onClose, cartItems, onCompleteOrder }) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    district: 'insideDhaka',
    paymentMethod: 'COD',
    trxId: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const deliveryFee = customer.district === 'insideDhaka' ? STORE_CONFIG.deliveryCharges.insideDhaka : STORE_CONFIG.deliveryCharges.outsideDhaka;
  const grandTotal = subtotal + deliveryFee;

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    
    const orderData = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString('bn-BD'),
      timestamp: Date.now(),
      isRealTime: true,
      customer,
      items: cartItems,
      subtotal,
      deliveryFee,
      grandTotal,
    };

    // Save to LocalStorage order history
    const existingOrders = JSON.parse(localStorage.getItem('giftvibes_store_orders') || '[]');
    localStorage.setItem('giftvibes_store_orders', JSON.stringify([orderData, ...existingOrders]));

    // Dispatch real-time live notification event
    window.dispatchEvent(new CustomEvent('giftvibes_new_order', { detail: orderData }));

    // Format WhatsApp Message
    const itemsList = cartItems
      .map((i) => `• ${i.name} ${i.selectedColor ? `(কালার: ${i.selectedColor})` : (i.selectedSize ? `(Size: ${i.selectedSize})` : '')} x${i.quantity || 1} - ৳${(i.price * (i.quantity || 1)).toLocaleString()}`)
      .join('\n');

    const message = `🛍️ *নতুন ইনভয়েস অর্ডার - ${STORE_CONFIG.storeName}*\n\n📋 *অর্ডার আইডি:* #${orderData.id}\n👤 *কাস্টমার নাম:* ${customer.name}\n📱 *ফোন:* ${customer.phone}\n📍 *ঠিকানা:* ${customer.address} (${customer.district === 'insideDhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})\n\n📦 *পণ্যসমূহ:*\n${itemsList}\n\n💵 *সাবটোটাল:* ৳${subtotal.toLocaleString()} BDT\n🚚 *কুরিয়ার ফি:* ৳${deliveryFee} BDT\n💰 *সর্বমোট:* ৳${grandTotal.toLocaleString()} BDT\n💳 *পেমেন্ট পদ্ধতি:* ${customer.paymentMethod === 'COD' ? 'ক্যাশ অন ডেলিভারি (COD)' : `বিকাশ/নগদ ম্যানুয়াল (TrxID: ${customer.trxId || 'N/A'})`}\n\nদয়া করে অর্ডারটি কনফার্ম করে ডেলিভারি বুকিং জানান।`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`, '_blank');

    setIsSuccess(true);
    if (onCompleteOrder) onCompleteOrder(orderData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm font-sans">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">আপনার অর্ডার সফলভাবে গৃহীত হয়েছে!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                অর্ডারের রসিদ ও বিস্তারিত তথ্য হোয়াটসঅ্যাপে পাঠানো হয়েছে। খুব শীঘ্রই আমাদের রিপ্রেজেন্টেটিভ কল দিয়ে ডেলিভারি কনফার্ম করবে।
              </p>
              <button
                onClick={() => { setIsSuccess(false); onClose(); }}
                className="px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                পপআপ বন্ধ করুন
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900">ক্যাশ অন ডেলিভারি সহজ চেকআউট</h2>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা দিন। পার্সেল হাতে পেয়ে চেক করে মূল্য পরিশোধ করবেন।
                </p>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs font-sans">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    আপনার সম্পূর্ণ নাম: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ রহিম হোসাইন"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    মোবাইল নম্বর: *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 017XXXXXXXX"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Address & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      ডেলিভারি এরিয়া:
                    </label>
                    <select
                      value={customer.district}
                      onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono font-bold"
                    >
                      <option value="insideDhaka">ঢাকার ভেতরে (কুরিয়ার ৳৮০)</option>
                      <option value="outsideDhaka">ঢাকার বাইরে (কুরিয়ার ৳১৩০)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      বিস্তারিত ঠিকানা: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="বাসা/রোড নম্বর, থানা, জেলা"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-2">
                    পেমেন্ট পদ্ধতি নির্বাচন করুন:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* COD Option */}
                    <div
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'COD' })}
                      className={`p-3 border rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                        customer.paymentMethod === 'COD'
                          ? 'bg-orange-50 border-orange-600 text-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-orange-600" />
                      <div>
                        <span className="block text-xs font-mono">ক্যাশ অন ডেলিভারি</span>
                        <span className="text-[10px] text-slate-400 font-normal">পণ্য হাতে পেয়ে পেমেন্ট দিন</span>
                      </div>
                    </div>

                    {/* bKash / Nagad Option */}
                    <div
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'BKASH' })}
                      className={`p-3 border rounded-xl cursor-pointer flex items-center gap-3 transition-all ${
                        customer.paymentMethod === 'BKASH'
                          ? 'bg-pink-50 border-pink-600 text-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-pink-600" />
                      <div>
                        <span className="block text-xs font-mono">বিকাশ / নগদ ম্যানুয়াল</span>
                        <span className="text-[10px] text-slate-400 font-normal">সেন্ড মানি ও TrxID প্রদান</span>
                      </div>
                    </div>

                  </div>

                  {/* TrxID Input Box if bKash selected */}
                  {customer.paymentMethod === 'BKASH' && (
                    <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-xl space-y-2 text-xs font-mono">
                      <p className="text-[11px] text-pink-900 font-semibold">
                        📲 আমাদের বিকাশ/নগদ নম্বরে <b>৳{grandTotal.toLocaleString()} BDT</b> সেন্ড মানি করুন: <br />
                        <span className="text-pink-700 font-bold">{STORE_CONFIG.bkashNumber}</span>
                      </p>
                      <input
                        type="text"
                        placeholder="বিকাশ / নগদ Transaction ID (TrxID) লিখুন"
                        value={customer.trxId}
                        onChange={(e) => setCustomer({ ...customer, trxId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-pink-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  )}

                </div>

                {/* Bill Summary */}
                <div className="bg-slate-100 p-4 rounded-xl space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>প্রোডাক্ট সাবটোটাল:</span>
                    <span>৳{subtotal.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>কুরিয়ার হোম ডেলিভারি ফি:</span>
                    <span>৳{deliveryFee} BDT</span>
                  </div>
                  <div className="flex items-center justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>সর্বমোট (Grand Total):</span>
                    <span className="text-orange-600">৳{grandTotal.toLocaleString()} BDT</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <MessageSquare className="w-4 h-4 fill-white stroke-none" />
                  <span>অর্ডার সম্পূর্ণ করুন (ক্যাশ অন ডেলিভারি)</span>
                </button>

              </form>
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
