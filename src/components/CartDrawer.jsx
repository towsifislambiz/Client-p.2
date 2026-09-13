import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onProceedCheckout }) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end font-sans">
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        >
          {/* Cart Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">শপিং কার্ট ({cartItems.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                <p className="text-sm font-mono font-semibold text-slate-500">আপনার কার্ট খালি রয়েছে</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-orange-600 text-white font-mono text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  শপিং শুরু করুন
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.selectedColor || item.selectedSize}-${idx}`}
                  className="p-3 border border-slate-200 rounded-2xl flex items-center gap-3 bg-slate-50/50"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    {item.selectedColor && (
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block w-fit mt-0.5">
                        কালার: {item.selectedColor}
                      </span>
                    )}
                    {item.selectedSize && !item.selectedColor && (
                      <span className="text-[10px] font-mono text-slate-500 block">সাইজ: {item.selectedSize}</span>
                    )}
                    <span className="text-xs font-mono font-bold text-amber-600 block mt-1">
                      ৳{item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item, (item.quantity || 1) - 1)}
                      className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
                      className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Total */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="text-slate-600 font-semibold">সাবটোটাল (Subtotal):</span>
                <span className="text-xl font-black text-slate-900">৳{subtotal.toLocaleString()} BDT</span>
              </div>

              <p className="text-[11px] text-slate-400 text-center font-mono">
                * ডেলিভারি চার্জ পরবর্তী অর্ডারের ধাপে যুক্ত করা হবে
              </p>

              <button
                onClick={onProceedCheckout}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>অর্ডার কনফার্ম করুন (Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
