import React from 'react';
import { ShoppingBag, MessageSquare, Star, Eye, Sparkles, ShieldCheck, Flame, Ban } from 'lucide-react';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function ProductCard({ product, onQuickView, onAddToCart, onBuyWhatsApp }) {
  const stock = typeof product.stock === 'number' ? product.stock : (product.inStock === false ? 0 : 10);
  const isSoldOut = stock <= 0 || product.inStock === false;
  const isLowStock = !isSoldOut && stock <= 3;

  return (
    <div className={`group bg-white rounded-2xl border ${isSoldOut ? 'border-slate-200 opacity-90' : 'border-slate-200/80 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-950/10 hover:-translate-y-1'} transition-all duration-300 flex flex-col justify-between overflow-hidden relative w-full max-w-sm sm:max-w-none mx-auto`}>
      
      {/* Top Image Showcase */}
      <div 
        className="relative overflow-hidden bg-slate-100 cursor-pointer aspect-square" 
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isSoldOut ? 'grayscale-30 scale-100' : 'group-hover:scale-106'}`}
        />

        {/* Ambient Gradient Overlay on hover */}
        {!isSoldOut && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* Sold Out Full Image Overlay */}
        {isSoldOut ? (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-20">
            <span className="bg-red-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-red-400/60 uppercase tracking-wide flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5" /> স্টক শেষ (Sold Out)
            </span>
            <span className="text-[11px] text-slate-300 mt-1 font-medium">বর্তমানে এভেইলেবল নেই</span>
          </div>
        ) : (
          /* Normal Top Badges on Image */
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
            <span className="bg-slate-950/80 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md flex items-center gap-1">
              <span>{product.originalPrice && product.originalPrice > product.price ? `🔥 ${toBengaliNumber(product.originalPrice - product.price)}৳ ছাড়` : '🔥 বিশেষ ছাড়'}</span>
            </span>

            <span className="bg-amber-950/80 text-amber-200 border border-amber-400/25 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md">
              ✨ ১১-ইন-১ কম্বো
            </span>
          </div>
        )}

        {/* Quick View Floating Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-slate-200/90 flex items-center gap-1.5 text-[11px] font-bold z-20"
          title="বিস্তারিত দেখুন"
        >
          <Eye className="w-3.5 h-3.5 text-amber-600" />
          <span>কুইক ভিউ</span>
        </button>
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        
        <div className="space-y-1.5">
          {/* Top Row: Color Badge + Rating + Stock Count */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-amber-50/80 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px] font-bold truncate max-w-[130px]">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate">{product.color}</span>
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className={`text-[15px] font-bold ${isSoldOut ? 'text-slate-500' : 'text-slate-900 group-hover:text-amber-700'} leading-snug cursor-pointer transition-colors line-clamp-1`}
          >
            {product.banglaName || product.name}
          </h3>

          {/* Included 11-in-1 Items Strip */}
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg px-2.5 py-1 text-[10.5px] text-amber-950 font-medium flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{product.itemsList || 'তাঁতের শাড়ি • চুড়ি • গলার সেট • কানের দুল • টিকলি • গাজরা • কাঠগোলাপ • বো ক্লিপ • টিপ • চিরকুট • গিফ্ট বক্স'}</span>
          </div>

          {/* Realtime Stock Indicator Badge */}
          <div className="pt-0.5">
            {isSoldOut ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
                <Ban className="w-3 h-3 text-red-600" /> স্টক শেষ (Sold Out)
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md animate-pulse">
                <Flame className="w-3 h-3 text-rose-600" /> দ্রুত ফুরিয়ে যাচ্ছে! মাত্র {toBengaliNumber(stock)}টি বাকি
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> স্টকে আছে ({toBengaliNumber(stock)}টি রেডি)
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="space-y-2.5 pt-1">
          
          {/* Price Row */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl sm:text-2xl font-black ${isSoldOut ? 'text-slate-500' : 'text-slate-900'}`}>
                ৳{toBengaliNumber(product.price?.toLocaleString())}
              </span>
              {product.originalPrice && (
                <span className="text-xs font-semibold text-slate-400 line-through">
                  ৳{toBengaliNumber(product.originalPrice?.toLocaleString())}
                </span>
              )}
            </div>
            
            {isSoldOut ? (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                অর্ডার বন্ধ
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                {product.originalPrice && product.originalPrice > product.price
                  ? `${toBengaliNumber(Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))}% সেভ`
                  : 'অফার'}
              </span>
            )}
          </div>

          {/* Side-by-Side Action Buttons or Sold Out Disabled Bar */}
          {isSoldOut ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled
                className="py-2.5 px-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1"
              >
                <span>স্টক শেষ</span>
              </button>
              <button
                disabled
                className="py-2.5 px-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1"
              >
                <span>Sold Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Order Button */}
              <button
                onClick={() => onAddToCart({ ...product, selectedColor: product.color })}
                className="py-2.5 px-2 bg-slate-900 hover:bg-black text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl shadow-xs border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                title="অর্ডার করতে কার্টে যোগ করুন"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">অর্ডার করুন</span>
              </button>

              {/* WhatsApp Direct Order Button */}
              <button
                onClick={() => onBuyWhatsApp({ ...product, selectedColor: product.color })}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                title="হোয়াটসঅ্যাপে সরাসরি অর্ডার"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white stroke-none shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>
            </div>
          )}

          {/* Micro Trust */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              ক্যাশ অন ডেলিভারি
            </span>
            <span>•</span>
            <span>পার্সেল দেখে পেমেন্ট</span>
          </div>

        </div>

      </div>

    </div>
  );
}
