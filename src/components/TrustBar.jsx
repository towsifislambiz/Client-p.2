import React from 'react';
import { Truck, ShieldCheck, Clock, Headphones } from 'lucide-react';

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-slate-200 py-4 sm:py-6 px-3 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-center sm:text-left">
        
        <div className="flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/40 transition-colors">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 leading-tight truncate sm:overflow-visible">সারাদেশে ডেলিভারি</h4>
            <span className="text-[9.5px] sm:text-[11px] text-slate-500 block truncate sm:overflow-visible mt-0.5">১-৩ দিনে হোম ডেলিভারি</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/40 transition-colors">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 leading-tight truncate sm:overflow-visible">পার্সেল দেখে পেমেন্ট</h4>
            <span className="text-[9.5px] sm:text-[11px] text-slate-500 block truncate sm:overflow-visible mt-0.5">১০০% ক্যাশ অন ডেলিভারি</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/40 transition-colors">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 leading-tight truncate sm:overflow-visible">১১-ইন-১ গিফট বক্স</h4>
            <span className="text-[9.5px] sm:text-[11px] text-slate-500 block truncate sm:overflow-visible mt-0.5">চিরকুট সহ সম্পূর্ণ রেডি বক্স</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/40 transition-colors">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 leading-tight truncate sm:overflow-visible">২৪/৭ কাস্টমার কেয়ার</h4>
            <span className="text-[9.5px] sm:text-[11px] text-slate-500 block truncate sm:overflow-visible mt-0.5">হোয়াটসঅ্যাপে সরাসরি সাহায্য</span>
          </div>
        </div>

      </div>
    </div>
  );
}
