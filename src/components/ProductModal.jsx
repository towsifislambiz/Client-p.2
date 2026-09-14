import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, MessageSquare, Star, Truck, ShieldCheck, Check, Sparkles, Gift, Flame, Ban } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';
import { ALL_COLOR_VARIATIONS, COMBO_ITEMS } from '../data/products';

export default function ProductModal({ product, onClose, onAddToCart, onBuyWhatsApp }) {
  const [selectedColor, setSelectedColor] = useState(product?.color || 'Red + Maroon');
  const [activeImage, setActiveImage] = useState(product?.image || '/images/products/red-maroon.webp');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.color || 'Red + Maroon');
      setActiveImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const stock = typeof product.stock === 'number' ? product.stock : (product.inStock === false ? 0 : 10);
  const isSoldOut = stock <= 0 || product.inStock === false;
  const isLowStock = !isSoldOut && stock <= 3;

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj.name);
    setActiveImage(colorObj.image);
  };

  const handleAdd = () => {
    if (isSoldOut) return;
    onAddToCart({
      ...product,
      name: `Premium Saree Combo (${selectedColor})`,
      selectedColor,
      image: activeImage,
      quantity,
      stock,
    });
    onClose();
  };

  const handleWhatsApp = () => {
    if (isSoldOut) return;
    onBuyWhatsApp({
      ...product,
      name: `Premium Saree Combo (${selectedColor})`,
      selectedColor,
      image: activeImage,
      quantity,
      stock,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[94vh] overflow-y-auto shadow-2xl relative p-4 sm:p-7 font-sans"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 bg-white/90 sm:bg-transparent rounded-full shadow-xs sm:shadow-none hover:bg-slate-100 transition-colors cursor-pointer z-20"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-7 items-start">
            
            {/* Left Column (5 cols): Image & Colors */}
            <div className="md:col-span-5 space-y-3">
              {/* Main Image Box */}
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-amber-500/30 shadow-md relative group aspect-square">
                <img
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${isSoldOut ? 'grayscale-30' : ''}`}
                />

                {/* Sold Out Overlay or Badges */}
                {isSoldOut ? (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                    <span className="bg-red-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-red-400/60 uppercase tracking-wide flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" /> স্টক শেষ (Sold Out)
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1 font-medium">বর্তমানে এভেইলেবল নেই</span>
                  </div>
                ) : (
                  <>
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-md">
                      ১৮% ছাড় (৩০০৳ সেভ)
                    </span>
                    <span className="absolute bottom-3 left-3 bg-slate-950/85 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs border border-amber-400/20 truncate max-w-[85%]">
                      কালার: {selectedColor}
                    </span>
                  </>
                )}
              </div>

              {/* Color Swatch Thumbnails */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  🎨 কালার ভ্যারিয়েশন বেছে নিন (১১টি অপশন):
                </span>
                <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {ALL_COLOR_VARIATIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleColorChange(c)}
                      title={c.name}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all p-0.5 cursor-pointer aspect-square ${
                        selectedColor === c.name
                          ? 'border-amber-500 ring-2 ring-amber-400/50 scale-105'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover rounded" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Content Details & Side-by-Side Actions */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Product Header & Rating */}
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" /> সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কম্বো
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-tight">
                  {product.banglaName || product.name} ({selectedColor})
                </h2>
                <div className="flex items-center gap-2 text-xs mt-1.5">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    <span>5.0</span>
                  </div>
                  <span className="text-slate-400">({product.reviewsCount || 48} কাস্টমার রিভিউ)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-medium">১০০% প্রিমিয়াম কোয়ালিটি</span>
                </div>
              </div>

              {/* Price & Stock Row - Fully Responsive & Spacious! */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl sm:text-3xl font-black ${isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                    ৳১,৩৫০
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                    ৳১,৬৫০
                  </span>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                    ৩০০/- ছাড়
                  </span>
                </div>

                {/* Stock Indicator Badge */}
                <div>
                  {isSoldOut ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 bg-red-100/80 border border-red-300 px-2.5 py-1 rounded-lg">
                      <Ban className="w-3 h-3" /> স্টক শেষ (Sold Out)
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 border border-rose-300 px-2.5 py-1 rounded-lg animate-pulse">
                      <Flame className="w-3.5 h-3.5 text-rose-600" /> মাত্র {stock}টি বাকি!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> স্টকে আছে: {stock}টি রেডি
                    </span>
                  )}
                </div>
              </div>

              {/* Included 11-in-1 Combo Items (Clean 2-Column Grid) */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> কম্বো প্যাকেজে যা যা থাকছে (১১টি উপহার):
                  </h4>
                  <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    ১১-ইন-১
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-700">
                  {COMBO_ITEMS.map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5 truncate">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Counter */}
              {!isSoldOut && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    অর্ডার পরিমাণ (Quantity):
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                        title="১টি কমান"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-8 text-center bg-white py-1.5 border-x border-slate-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                        title="১টি বাড়ান"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">(সর্বোচ্চ {stock}টি)</span>
                  </div>
                </div>
              )}

              {/* Side-by-Side Action Buttons */}
              <div>
                {isSoldOut ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-red-700">
                      🚫 দুঃখিত, এই কম্বোটির বর্তমান স্টক শেষ হয়ে গেছে!
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      খুব দ্রুত নতুন স্টক আনা হবে। অনুগ্রহ করে অন্য কালার কম্বো অর্ডার করুন।
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {/* Primary Cart / Order Button */}
                    <button
                      onClick={handleAdd}
                      className="py-3 px-3 bg-slate-900 hover:bg-black text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl shadow-sm border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>কার্টে যোগ করুন (Checkout)</span>
                    </button>

                    {/* WhatsApp Direct Order Button */}
                    <button
                      onClick={handleWhatsApp}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm border border-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="w-4 h-4 fill-white stroke-none shrink-0" />
                      <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Micro Trust & Gift Note Strip */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ঢাকা ৳৮০, বাইরে ৳১৩০
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  পার্সেল দেখে পেমেন্ট (COD)
                </span>
                <span className="text-amber-900 font-medium">
                  💌 ফ্রি উইশ মেসেজ কার্ড
                </span>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
