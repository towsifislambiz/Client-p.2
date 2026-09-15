import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Phone, MessageSquare, ShieldCheck, Sparkles, User, Settings } from 'lucide-react';
import { STORE_CONFIG as STATIC_STORE_CONFIG } from '../data/storeConfig';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function Navbar({ cartCount, onOpenCart, onOpenAdmin, searchQuery, setSearchQuery, storeSettings, products }) {
  const STORE_CONFIG = storeSettings || STATIC_STORE_CONFIG;
  const displayPrice = products && products.length > 0 && products[0].price ? products[0].price : 1350;
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs font-sans">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white text-[10px] sm:text-[11px] font-semibold py-1 sm:py-1.5 px-3 sm:px-4 text-center flex items-center justify-between">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <span className="flex items-center gap-1.5 mx-auto sm:mx-0 truncate sm:overflow-visible">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse text-amber-200 shrink-0" />
            <span className="truncate sm:overflow-visible">✨ সম্পূর্ণ ১১-ইন-১ তাঁতের শাড়ি কম্বো মাত্র {toBengaliNumber(displayPrice)}/- টাকা • ক্যাশ অন ডেলিভারি</span>
          </span>

          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-amber-200">
              <ShieldCheck className="w-3.5 h-3.5" /> ১০০% প্রিমিয়াম প্যাকেজিং
            </span>
            <span className="flex items-center gap-1 text-amber-100">
              <Phone className="w-3 h-3" /> হেল্পলাইন: {STORE_CONFIG.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0">
          <div className="relative">
            <img
              src={STORE_CONFIG.logoIcon || STORE_CONFIG.logo || '/images/logo-icon.webp'}
              alt={STORE_CONFIG.storeName}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover shadow-md border-2 border-amber-500/50 bg-black p-0.5"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
              <span>{STORE_CONFIG.storeName}</span>
              <span className="text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">BD</span>
            </h1>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block mt-0.5 tracking-wide truncate max-w-[170px] sm:max-w-none">
              {STORE_CONFIG.storeTagline}
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="পছন্দের কালার বা কম্বো খুঁজুন (যেমন: লাল, কালো, নীল)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-sans"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        </div>

        {/* Action Buttons (Admin + WhatsApp + Cart) */}
        <div className="flex items-center gap-2.5">
          
          {/* Admin Dashboard Trigger */}
          <Link
            to="/admin/login"
            className="p-2 sm:px-3 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-200 shadow-xs"
            title="এডমিন ড্যাশবোর্ড"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="inline">ড্যাশবোর্ড</span>
          </Link>

          {/* WhatsApp Direct Chat */}
          <a
            href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-emerald-600 stroke-none" />
            <span>হোয়াটসঅ্যাপ সাহায্য</span>
          </a>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">কার্ট</span>
            
            {cartCount > 0 && (
              <span className="w-5 h-5 bg-orange-500 text-white font-mono font-black text-[10px] rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center relative">
          <input
            type="text"
            placeholder="প্রোডাক্ট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        </div>
      </div>

    </header>
  );
}
