import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, ShieldCheck, Truck, ArrowRight, Sparkles, Gift, Star, Check, Flame } from 'lucide-react';
import { STORE_CONFIG as STATIC_STORE_CONFIG } from '../data/storeConfig';
import { COMBO_ITEMS, ALL_COLOR_VARIATIONS } from '../data/products';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function HeroBanner({ onOrderNow, products, heroContent, storeSettings }) {
  const STORE_CONFIG = storeSettings || STATIC_STORE_CONFIG;
  const badge = heroContent?.badge || heroContent?.badgeText || '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কালেকশন';
  const headline1 = heroContent?.headlineMain || 'তাঁতে বোনা সুতির শাড়ি';
  const headline2 = heroContent?.headlineSub || '১১-ইন-১ গিফট কম্বো';
  const cta = heroContent?.ctaText || 'অর্ডার করতে চাই';
  const ctaSub = heroContent?.ctaSubText || 'কালার সিলেক্ট করে সরাসরি অর্ডার করুন';

  // Live color variations from synced products or static fallback
  const colorItems = (products && products.length > 0)
    ? products.map((p) => ({
        id: p.id,
        name: p.color || p.name,
        banglaName: p.banglaName || p.name,
        image: p.image || '/images/products/red-maroon.webp',
        price: p.price || 1350,
        originalPrice: p.originalPrice || 1650,
      }))
    : ALL_COLOR_VARIATIONS;

  const [selectedColorObj, setSelectedColorObj] = useState(colorItems[0]);
  const [activeImage, setActiveImage] = useState(null);

  React.useEffect(() => {
    setActiveImage(null);
  }, [heroContent?.bannerImage]);

  React.useEffect(() => {
    if (colorItems && colorItems.length > 0) {
      setSelectedColorObj((prev) => {
        const found = colorItems.find((c) => String(c.id) === String(prev?.id));
        return found || colorItems[0];
      });
    }
  }, [products]);

  const displayImage = activeImage || heroContent?.bannerImage || selectedColorObj?.image || "/images/products/red-maroon.webp";
  const displayCardBadge = heroContent?.bannerCardBadge || '⭐ টপ সেলিং গিফট কম্বো';
  const displayCardTitle = heroContent?.bannerCardTitle || (selectedColorObj?.name ? `তাঁতে বোনা সুতির শাড়ি কম্বো (${selectedColorObj.name})` : 'তাঁতে বোনা সুতির শাড়ি কম্বো');

  const currentPrice = selectedColorObj?.price || 1350;
  const currentOrigPrice = selectedColorObj?.originalPrice || 1650;
  const currentDiscount = currentOrigPrice > currentPrice ? currentOrigPrice - currentPrice : 300;
  const discountPercent = currentOrigPrice > currentPrice ? Math.round(((currentOrigPrice - currentPrice) / currentOrigPrice) * 100) : 18;

  const handleScrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrder = () => {
    if (onOrderNow) {
      const match = products?.find(
        (p) => String(p.id) === String(selectedColorObj.id) || p.color?.toLowerCase() === selectedColorObj.name?.toLowerCase()
      ) || products?.[0];
      onOrderNow(match || { ...products?.[0], color: selectedColorObj.name, image: selectedColorObj.image });
    } else {
      handleScrollToProducts();
    }
  };

  const waMessage = `হ্যালো ${STORE_CONFIG.storeName}, আমি আপনাদের তাঁতে বোনা সুতির শাড়ি (${selectedColorObj.banglaName || selectedColorObj.name}) ১১-ইন-১ গিফট কম্বোটি অর্ডার করতে চাই।`;

  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-5 sm:py-8 lg:py-12 px-3 sm:px-8 relative overflow-hidden font-sans">
      
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* MOBILE-FIRST VIEW (< lg): Product Photo & Order Now Button Right at the Top! */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-3.5 max-w-md mx-auto relative z-10">
        
        {/* Top Header Pill & Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full text-[10.5px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span>{badge}</span>
          </div>
          <h2 className="text-xl font-black text-white leading-snug">
            {headline1}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-400">
              {headline2}
            </span>
          </h2>
        </div>

        {/* 1. UPFRONT HERO PRODUCT IMAGE (First thing mobile visitors see!) */}
        <div 
          onClick={handleOrder}
          className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-slate-950 cursor-pointer group"
        >
          <img
            src={displayImage}
            alt={displayCardTitle}
            className="w-full h-[310px] sm:h-[360px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges on Image */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-rose-600/95 text-white text-[10.5px] font-extrabold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
              <span>{toBengaliNumber(currentDiscount)}৳ ছাড়</span>
            </span>
            <span className="bg-amber-400 text-slate-950 text-[10.5px] font-black px-2.5 py-1 rounded-full shadow-lg">
              {displayCardBadge}
            </span>
          </div>

          {/* Color Indicator Bar on Bottom of Image */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-amber-300 truncate">
              {heroContent?.bannerCardTitle || `কালার: ${selectedColorObj.banglaName || selectedColorObj.name}`}
            </span>
            <span className="text-[10px] text-slate-300 font-medium shrink-0">
              ({toBengaliNumber(colorItems.length)}টি কালার অ্যাভেইলেবল)
            </span>
          </div>
        </div>

        {/* 2. QUICK COLOR VARIATION SELECTOR */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2">
          <div className="flex items-center justify-between mb-1.5 px-0.5 text-[10.5px]">
            <span className="font-bold text-slate-300">কালার পছন্দ করুন (ট্যাপ করুন):</span>
            <span className="text-amber-400 font-semibold">{selectedColorObj.name}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {colorItems.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedColorObj(c); setActiveImage(c.image); }}
                className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 w-10 h-10 cursor-pointer ${
                  String(selectedColorObj.id) === String(c.id)
                    ? 'border-amber-400 ring-2 ring-amber-400/60 scale-105'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
                title={c.banglaName || c.name}
              >
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* 3. PRICE & IN-STOCK SUMMARY */}
        <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">৳{toBengaliNumber(currentPrice.toLocaleString())}</span>
              {currentOrigPrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through">৳{toBengaliNumber(currentOrigPrice.toLocaleString())}</span>
              )}
              <span className="text-[10px] font-extrabold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                {toBengaliNumber(discountPercent)}% ছাড়
              </span>
            </div>
            <p className="text-[10.5px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              স্টকে আছে • ক্যাশ অন ডেলিভারি
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-1 rounded-lg border border-amber-500/30 block whitespace-nowrap">
              🎁 রেডি গিফট বক্স
            </span>
          </div>
        </div>

        {/* 4. THE BIG "অর্ডার করতে চাই" CTA BUTTON (Direct High Conversion Action) */}
        <button
          onClick={handleOrder}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2.5 transition-transform active:scale-98 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 fill-white shrink-0" />
          <span>{cta}</span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>

        {/* 5. SECONDARY BUTTONS: WHATSAPP & SCROLL DOWN */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white shrink-0" />
            <span>হোয়াটসঅ্যাপ অর্ডার</span>
          </a>

          <button
            onClick={handleScrollToProducts}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
          >
            <span>নিচে আরো দেখুন 👇</span>
          </button>
        </div>

        {/* 6. 11-IN-1 COMBO BREAKDOWN CARD */}
        <div className="bg-slate-800/80 border border-amber-500/25 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              কম্বোতে যা যা থাকছে (১১টি উপহার):
            </h4>
            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
              ১১-ইন-১
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
            {COMBO_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 px-2 py-1.5 rounded-lg text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. MOBILE MICRO TRUST BADGES */}
        <div className="flex items-center justify-around gap-1 text-[10.5px] font-medium text-slate-300 pt-1">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> সারাদেশে ডেলিভারি
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" /> ক্যাশ অন ডেলিভারি
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none shrink-0" /> ৫.০ রিভিউ
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (lg:grid): Preserved exactly as requested for PC */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-12 gap-8 items-center max-w-7xl mx-auto relative z-10">
        
        {/* Left Column Content (col-span-7) */}
        <div className="col-span-7 space-y-6 text-left">
          
          <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>{badge}</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-snug text-white">
            {headline1}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-400">
              {headline2}
            </span>
          </h2>

          <p className="text-sm lg:text-base text-slate-300 leading-relaxed max-w-xl">
            একটি প্রিমিয়াম তাঁতে বোনা সুতির শাড়ি, ম্যাচিং চুড়ি, গলার সেট, কানের দুল, টিকলি, সুবাসিত গাজরা, কাঠগোলাপ হেয়ারক্লিপ, বো ক্লিপ, টিপ, কার্ড/চিরকুট ও আকর্ষণীয় গিফ্ট বক্স—সম্পূর্ণ ১১-ইন-১ রাজকীয় উপহার প্যাকেজ।
          </p>

          {/* Luxury 11-in-1 Boutique Package Card */}
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-3xl p-5 backdrop-blur-md shadow-2xl space-y-4 max-w-xl">
            
            {/* Box Header: Value summary & Special Price */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 gap-2">
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-inner shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                    কম্বো গিফট বক্স প্যাকেজ
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                    সম্পূর্ণ ১১-ইন-১ স্পেশাল গিফট সেট
                  </h3>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-2xl font-black text-amber-400">৳{toBengaliNumber(currentPrice.toLocaleString())}</span>
                  {currentOrigPrice > currentPrice && (
                    <span className="text-xs text-slate-400 line-through">৳{toBengaliNumber(currentOrigPrice.toLocaleString())}</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  স্টকে আছে
                </span>
              </div>
            </div>

            {/* 11 Items Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {COMBO_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-700/50 text-slate-200">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Direct Fast CTA Row */}
            <div className="pt-1 flex items-center gap-2.5">
              <button
                onClick={handleOrder}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 fill-white shrink-0" />
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
              >
                <MessageSquare className="w-4 h-4 fill-white stroke-none shrink-0" />
                <span>হোয়াটসঅ্যাপ অর্ডার</span>
              </a>
            </div>

          </div>

          {/* Quick Badges */}
          <div className="pt-1 flex items-center gap-3.5 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" /> সারাদেশে ১-৩ দিনে হোম ডেলিভারি
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" /> পার্সেল দেখে ক্যাশ অন ডেলিভারি
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none shrink-0" /> ৫.০ স্টার রিভিউ
            </span>
          </div>

        </div>

        {/* Right Column Product Showcase Visual (col-span-5) */}
        <div className="col-span-5 relative">
          <div 
            onClick={handleOrder}
            className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/40 group cursor-pointer"
          >
            <img
              src={displayImage}
              alt={displayCardTitle}
              className="w-full h-[430px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full w-fit mb-2">
                {displayCardBadge}
              </span>
              <h3 className="text-xl font-bold text-white mb-1">
                {displayCardTitle}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">৳{toBengaliNumber(currentPrice.toLocaleString())}</span>
                {currentOrigPrice > currentPrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">৳{toBengaliNumber(currentOrigPrice.toLocaleString())}</span>
                )}
                <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  {toBengaliNumber(currentDiscount)}/- ছাড়
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
