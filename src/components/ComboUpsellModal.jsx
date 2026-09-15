import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, CheckCircle2, ArrowRight, Sparkles, Plus, Check, Gift } from 'lucide-react';
import { ALL_COLOR_VARIATIONS, COMBO_ITEMS_SUMMARY, COMBO_DESCRIPTION } from '../data/products';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function ComboUpsellModal({
  isOpen,
  onClose,
  addedProduct,
  cartItems = [],
  products = [],
  onAddToCart,
  onProceedCheckout,
  onOpenCart,
}) {
  const [addedComboIds, setAddedComboIds] = useState([]);

  if (!isOpen) return null;

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Filter recommendations: other products/colors not matching recently added
  const otherColors = (products && products.length > 0)
    ? products
        .filter((p) => String(p.id) !== String(addedProduct?.id) && (p.color || '').toLowerCase() !== (addedProduct?.selectedColor || addedProduct?.color || '').toLowerCase())
        .map((p) => ({
          id: p.id,
          name: p.color || p.name,
          banglaName: p.banglaName || p.name,
          image: p.image || '/images/products/red-maroon.webp',
          price: Number(p.price) || 1350,
          originalPrice: Number(p.originalPrice) || 1650,
          rawProduct: p,
        }))
    : ALL_COLOR_VARIATIONS.filter(
        (c) => c.name.toLowerCase() !== (addedProduct?.selectedColor || addedProduct?.color || '').toLowerCase()
      ).map((c) => ({
        ...c,
        price: 1350,
        originalPrice: 1650,
      }));

  const handleQuickAddOtherColor = (colorObj) => {
    if (colorObj.rawProduct) {
      onAddToCart(
        {
          ...colorObj.rawProduct,
          selectedColor: colorObj.rawProduct.color || colorObj.name,
          quantity: 1,
        },
        true
      );
    } else {
      const newProduct = {
        id: colorObj.id,
        name: `Handloom Cotton Saree Combo - ${colorObj.name}`,
        banglaName: `${colorObj.banglaName} তাঁতের শাড়ি কম্বো`,
        tagline: 'তাঁতে বোনা সুতি শাড়ি ও সম্পূর্ণ ১১-ইন-১ প্যাকেজ',
        category: 'Special Combo',
        color: colorObj.name,
        selectedColor: colorObj.name,
        price: colorObj.price || 1350,
        originalPrice: colorObj.originalPrice || 1650,
        image: colorObj.image,
        quantity: 1,
        stock: 10,
        inStock: true,
        description: COMBO_DESCRIPTION,
        itemsList: COMBO_ITEMS_SUMMARY,
      };
      onAddToCart(newProduct, true); // true = silent/stay in modal
    }
    setAddedComboIds((prev) => [...prev, colorObj.id]);
  };

  const isColorInCart = (colorName, colorId) => {
    return (
      addedComboIds.includes(colorId) ||
      cartItems.some(
        (i) => (i.selectedColor || i.color || '').toLowerCase() === colorName.toLowerCase()
      )
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm font-sans">
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                  <span>সফলভাবে কার্টে যুক্ত হয়েছে!</span>
                </h3>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {addedProduct?.banglaName || addedProduct?.name || 'তাঁতের শাড়ি কম্বো'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recently Added Summary Box */}
          <div className="p-3 sm:p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={addedProduct?.image || '/images/products/red-maroon.webp'}
                alt="Added product"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mb-0.5">
                  কালার: {addedProduct?.selectedColor || addedProduct?.color || 'Red + Maroon'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {addedProduct?.banglaName || addedProduct?.name}
                </h4>
                <span className="text-xs font-black text-emerald-700">
                  ৳{(addedProduct?.price || 1350).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">কার্টে মোট ({totalItems}টি)</span>
              <span className="text-sm font-black text-slate-900">৳{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Upsell Offer Question (The Client's Request!) */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs sm:text-sm">
                <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                <span>আপনি কি সাথে আরও কোনো কালার কম্বো যুক্ত করতে চান?</span>
              </div>
              <p className="text-[11.5px] text-amber-950/80 leading-relaxed">
                প্রিয়জনকে উপহার দিতে বা নিজের পছন্দের আরেকটি কালার কম্বো একসাথে পেতে নিচে থেকে বেছে নিতে পারেন, অথবা সরাসরি চেকআউটে চলে যান:
              </p>
            </div>

            {/* Other Color Combos Selection Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  অন্যান্য জনপ্রিয় কালার কালেকশন:
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {toBengaliNumber(otherColors.length)}টি কালার অপশন
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-[220px] sm:max-h-[250px] overflow-y-auto p-1 pr-1.5">
                {otherColors.map((color) => {
                  const inCart = isColorInCart(color.name, color.id);

                  return (
                    <div
                      key={color.id}
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                        inCart
                          ? 'bg-emerald-50/80 border-emerald-300'
                          : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={color.image}
                          alt={color.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                            {color.banglaName}
                          </h5>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-black text-amber-700">৳{toBengaliNumber(color.price?.toLocaleString())}</span>
                            {color.originalPrice && (
                              <span className="text-[9.5px] text-slate-400 line-through">৳{toBengaliNumber(color.originalPrice?.toLocaleString())}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {inCart ? (
                        <div className="py-1 px-2 bg-emerald-600 text-white font-bold text-[10.5px] rounded-xl flex items-center justify-center gap-1 text-center shadow-xs">
                          <Check className="w-3 h-3" />
                          <span>কার্টে যুক্ত আছে</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickAddOtherColor(color)}
                          className="w-full py-1.5 px-2 bg-white hover:bg-amber-500 text-amber-900 hover:text-slate-950 font-bold text-[10.5px] rounded-xl border border-amber-300 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-96"
                        >
                          <Plus className="w-3 h-3 text-amber-700" />
                          <span>+ এটিও যুক্ত করুন</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Buttons */}
          <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
            {/* Primary Action: Direct Checkout */}
            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-950/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 fill-white shrink-0" />
              <span>সরাসরি চেকআউট করুন (Proceed to Checkout)</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            {/* Secondary Actions: Open Cart or Keep Shopping */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>কার্ট ভিউ দেখুন ({totalItems})</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center cursor-pointer"
              >
                <span>আরও শপিং করুন</span>
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
