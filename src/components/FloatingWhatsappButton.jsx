import React from 'react';
import { MessageSquare } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export default function FloatingWhatsappButton() {
  return (
    <a
      href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`হ্যালো ${STORE_CONFIG.storeName}, আমি সরাসরি হোয়াটসঅ্যাপে সাহায্য চাই।`)}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-3.5 sm:bottom-6 sm:right-6 z-40 p-3 sm:px-4 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-full shadow-2xl shadow-emerald-600/40 border border-emerald-400/40 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer group"
      aria-label="Direct WhatsApp Chat"
    >
      <div className="relative">
        <MessageSquare className="w-5 h-5 fill-white stroke-none group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full" />
      </div>
      <span className="hidden sm:inline font-bold">হোয়াটসঅ্যাপ হেল্প</span>
    </a>
  );
}
