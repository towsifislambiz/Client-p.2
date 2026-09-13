import React from 'react';
import { ShoppingBag, MessageSquare, ShieldCheck, Truck, ArrowRight, Sparkles, Gift, Star } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export default function HeroBanner() {
  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-12 px-3 sm:px-8 relative overflow-hidden font-sans">
      
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
        
        {/* Left Column Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">প্রিয় মানুষকে উপহার দিয়ে মুখে হাসি ফোটান ✨</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug text-white">
            প্রিয় মানুষের মুখে হাসি ফোটাতে{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-400">
              এক্সক্লুসিভ শাড়ি গিফট কম্বো
            </span>
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            একটি প্রিমিয়াম সফট শাড়ি, ম্যাচিং চুড়ি, কুন্দন নেকলেস ও দুল, সুগন্ধি বেলি ফুলের মালা, টিপ পাতা ও ভালোবাসার চিঠি—প্রিয়জনকে সারপ্রাইজ দেওয়ার সম্পূর্ণ ৭-ইন-১ উপহার প্যাকেজ।
          </p>

          {/* Luxury 7-in-1 Boutique Package Card (Replaces the old timer) */}
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 backdrop-blur-md shadow-2xl space-y-3.5 sm:space-y-4 max-w-xl mx-auto lg:mx-0">
            
            {/* Box Header: Value summary & Special Price */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 text-left min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-inner shrink-0">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">রেডি-টু-গিফট সম্পূর্ণ বক্স</h4>
                    <span className="text-[9px] sm:text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs shrink-0">৭-ইন-১</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">আলাদা র‍্যাপিং ছাড়াই উপহার দেওয়ার প্রস্তুত বক্স</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] sm:text-xs text-slate-400 line-through block leading-tight">৳১,৬৫০</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 leading-tight">৳১,৩৫০</span>
              </div>
            </div>

            {/* 6 Included Items Grid (2 cols on mobile, 3 on sm+) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">সফট জরি পাড় শাড়ি</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">ম্যাচিং রেশমি চুড়ি</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">কুন্দন নেকলেস ও দুল</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">সুগন্ধি বেলি মালা</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">স্টোন টিপ ও বো</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 px-2 py-1.5 rounded-lg sm:rounded-xl text-slate-200">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">ফ্রি উইশ মেসেজ কার্ড</span>
              </div>
            </div>

            {/* Direct Fast CTA Row */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5">
              <button
                onClick={handleScrollToProducts}
                className="w-full sm:flex-1 py-3 px-3 sm:px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-slate-950 shrink-0" />
                <span>সকল কালার কালেকশন দেখুন (১১টি)</span>
                <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>

              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent('হ্যালো Gift Vibes, আমি আপনাদের প্রিমিয়াম শাড়ি গিফট কম্বোটি সম্পর্কে জানতে ও অর্ডার করতে চাই।')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
              >
                <MessageSquare className="w-4 h-4 fill-white stroke-none shrink-0" />
                <span>হোয়াটসঅ্যাপ অর্ডার</span>
              </a>
            </div>

          </div>

          {/* Quick Badges */}
          <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> সারাদেশে ১-৩ দিনে হোম ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" /> পার্সেল দেখে ক্যাশ অন ডেলিভারি
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none shrink-0" /> ৫.০ স্টার রিভিউ
            </span>
          </div>

        </div>

        {/* Right Column Product Showcase Visual */}
        <div className="lg:col-span-5 relative mt-2 lg:mt-0">
          <div 
            onClick={handleScrollToProducts}
            className="relative mx-auto max-w-xs sm:max-w-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-amber-500/40 group cursor-pointer"
          >
            <img
              src="/images/products/red-maroon.png"
              alt="Premium Saree Combo Showcase"
              className="w-full h-[280px] sm:h-[360px] lg:h-[430px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full w-fit mb-1.5 sm:mb-2">
                ⭐ টপ সেলিং গিফট কম্বো
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                Premium Saree Combo (Red + Maroon)
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-amber-400">৳১,৩৫০</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">৳১,৬৫০</span>
                <span className="text-[10px] sm:text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  ৩০০/- ছাড়
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
