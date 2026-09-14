import React from 'react';
import { ShieldCheck, Truck, MessageSquare, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { STORE_CONFIG as STATIC_STORE_CONFIG } from '../data/storeConfig';

export default function Footer({ storeSettings }) {
  const STORE_CONFIG = storeSettings || STATIC_STORE_CONFIG;
  return (
    <footer className="bg-slate-900 text-white pt-10 sm:pt-12 pb-8 px-3 sm:px-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top 3 Trust Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-800 text-center sm:text-left">
          
          <div className="flex items-center justify-start gap-3 bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
            <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs sm:text-sm text-white">১-৩ দিনে এক্সপ্রেস ডেলিভারি</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">সারাদেশে হোম সার্ভিস সুবিধা</p>
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs sm:text-sm text-white">ক্যাশ অন ডেলিভারি (COD)</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">পণ্য হাতে পেয়ে মূল্য পরিশোধ</p>
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 bg-slate-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs sm:text-sm text-white">২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট</h4>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">ইনস্ট্যান্ট সাহায্য ও ট্র্যাকিং</p>
            </div>
          </div>

        </div>

        {/* Footer Main Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-xs font-mono">
          
          <div className="space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <img
                src={STORE_CONFIG.logoIcon}
                alt={STORE_CONFIG.storeName}
                className="w-10 h-10 rounded-xl object-cover bg-black p-0.5 border border-amber-400/40"
              />
              {STORE_CONFIG.storeName}
            </h3>
            <p className="text-slate-400 leading-relaxed font-sans">
              {STORE_CONFIG.storeTagline}। আমাদের প্রতিটি শাড়ি গিফট কম্বো প্রিমিয়াম কোয়ালিটিতে প্রস্তুত করা হয়।
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">কাস্টমার কেয়ার</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• ডেলিভারি ও রিটার্ন পলিসি</li>
              <li>• প্রাইভেসি পলিসি</li>
              <li>• শর্তাবলী (Terms & Conditions)</li>
              <li>• FAQ / সাধারণ প্রশ্নসমূহ</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">পেমেন্ট মেথড</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• ক্যাশ অন ডেলিভারি (COD)</li>
              <li>• বিকাশ পার্সোনাল ({STORE_CONFIG.bkashNumber})</li>
              <li>• নগদ পার্সোনাল ({STORE_CONFIG.nagadNumber})</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3">যোগাযোগ ও ঠিকানা</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-1.5 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{STORE_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-500" /> {STORE_CONFIG.phone}</li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> {STORE_CONFIG.email}</li>
              <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> সকাল ৯টা - রাত ১১টা</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 {STORE_CONFIG.storeName}. All rights reserved.</span>
          <span className="text-amber-400 font-bold">Engineered for Gift Vibes ⚡</span>
        </div>

      </div>
    </footer>
  );
}
