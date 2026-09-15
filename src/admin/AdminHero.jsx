import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

export default function AdminHero() {
  const [hero, setHero] = useState({
    badge: '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কালেকশন',
    headlineMain: 'তাঁতে বোনা সুতির শাড়ি কম্বো গিফট সেট',
    headlineSub: 'প্রিয় মানুষের মুখে হাসি ফোটানোর সম্পূর্ণ ১১-ইন-১ রাজকীয় উপহার প্যাকেজ',
    offerText: 'সীমিত সময়ের জন্য ১৮% বিশেষ মূল্যছাড়!',
    ctaText: 'পছন্দের কম্বো অর্ডার করুন',
    bannerImage: '/images/products/red-maroon.webp',
    bannerCardBadge: '⭐ টপ সেলিং গিফট কম্বো',
    bannerCardTitle: 'তাঁতে বোনা সুতির শাড়ি কম্বো',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/site-data')
      .then((r) => r.json())
      .then((data) => {
        if (data.hero) {
          setHero((prev) => ({
            ...prev,
            ...data.hero,
            bannerImage: data.hero.bannerImage || prev.bannerImage,
            bannerCardBadge: data.hero.bannerCardBadge || prev.bannerCardBadge,
            bannerCardTitle: data.hero.bannerCardTitle || prev.bannerCardTitle,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, val) => {
    setHero((prev) => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  // Client-Side Canvas WebP Compression Pipeline
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let { width, height } = img;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Always compress to lightweight high-quality WebP
          const webpDataUrl = canvas.toDataURL('image/webp', 0.88);
          resolve(webpDataUrl);
        };
        img.onerror = () => reject(new Error('ইমেজ প্রসেসিং ব্যর্থ'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('ফাইল রিড ব্যর্থ'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const webpUrl = await compressImage(file);
      handleChange('bannerImage', webpUrl);
    } catch (err) {
      alert('ছবি প্রসেসিং ব্যর্থ: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.post('/site-data/update', { hero });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('সেভ ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">হিরো ব্যানার CMS ও ইমেজ ম্যানেজার</h2>
          </div>
          <p className="text-xs text-slate-400">
            ওয়েবসাইটের প্রধান টপ ব্যানারের ছবি, টেক্সট ও অফার কন্টেন্ট এখান থেকে পরিবর্তন করুন।
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>সফলভাবে সেভ হয়েছে ও লাইভ সাইটে প্রতিফলিত হয়েছে!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-2 bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
          
          {/* ─── Banner Showcase Image Upload Box ─── */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>ব্যানার / হিরো কার্ডের ছবি (Banner Showcase Image)</span>
              </label>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>স্বয়ংক্রিয় WebP কনভার্টার</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              যে কোনো ছবি (PNG, JPG, JPEG) সিলেক্ট করলেই মুহূর্তেই হালকা ও হাই-কোয়ালিটি WebP তে রূপান্তর হয়ে লাইভ ব্যানারে যুক্ত হবে।
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {hero.bannerImage ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center gap-3.5">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img
                    src={hero.bannerImage}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/products/red-maroon.webp';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ছবি নির্বাচিত আছে</span>
                  </p>
                  <p className="text-[10px] text-amber-400/90 font-medium mb-1.5">
                    {hero.bannerImage.startsWith('data:image/webp') ? '⚡ WebP ফরম্যাটে রূপান্তর সম্পন্ন' : '✓ লাইভ ব্যানার ইমেজ'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : 'অন্য ছবি আপলোড করুন'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('bannerImage', '')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>রিমুভ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-5 text-center transition-all group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : '📁 ব্যানার ছবি সিলেক্ট করুন (PC বা মোবাইল গ্যালারি)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  সরাসরি গ্যালারি থেকে যেকোনো ছবি দিলেই স্বয়ংক্রিয়ভাবে ব্যানার সেকশনে সেট হবে
                </p>
              </div>
            )}

            <div className="pt-1">
              <label className="text-[11px] text-slate-400 block mb-1">
                অথবা সরাসরি ছবির লিংক (Image URL):
              </label>
              <input
                type="text"
                value={hero.bannerImage || ''}
                onChange={(e) => handleChange('bannerImage', e.target.value)}
                placeholder="/images/products/red-maroon.webp অথবা https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>
          </div>

          {/* ─── Banner Card Details ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>ব্যানার কার্ড ব্যাজ</span>
              </label>
              <input
                type="text"
                value={hero.bannerCardBadge || ''}
                onChange={(e) => handleChange('bannerCardBadge', e.target.value)}
                placeholder="⭐ টপ সেলিং গিফট কম্বো"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>ব্যানার কার্ড টাইটেল</span>
              </label>
              <input
                type="text"
                value={hero.bannerCardTitle || ''}
                onChange={(e) => handleChange('bannerCardTitle', e.target.value)}
                placeholder="তাঁতে বোনা সুতির শাড়ি কম্বো"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* ─── Text Fields ─── */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">টপ ব্যাজ টেক্সট</label>
            <input
              type="text"
              value={hero.badge}
              onChange={(e) => handleChange('badge', e.target.value)}
              placeholder="✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কালেকশন"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">প্রধান হেডলাইন (Headline Main)</label>
            <input
              type="text"
              value={hero.headlineMain}
              onChange={(e) => handleChange('headlineMain', e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">সাব-হেডলাইন (Headline Subtitle)</label>
            <textarea
              rows={3}
              value={hero.headlineSub}
              onChange={(e) => handleChange('headlineSub', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">অফার টেক্সট</label>
              <input
                type="text"
                value={hero.offerText}
                onChange={(e) => handleChange('offerText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">বাটন টেক্সট (CTA Button)</label>
              <input
                type="text"
                value={hero.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-5">
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg sticky top-20">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>ব্যানার লাইভ প্রিভিউ</span>
            </h4>

            {/* Simulated Live Card */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3">
              {hero.bannerImage && (
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={hero.bannerImage}
                    alt="Live Hero Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/products/red-maroon.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-500/30">
                    {hero.bannerCardBadge || '⭐ টপ সেলিং গিফট কম্বো'}
                  </span>
                </div>
              )}

              <div className="p-3.5 space-y-2 text-center">
                <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {hero.badge}
                </span>
                <h5 className="text-base font-black text-white tracking-tight leading-snug">
                  {hero.headlineMain}
                </h5>
                <p className="text-[11px] text-slate-400">
                  {hero.headlineSub}
                </p>
                <div className="pt-2">
                  <span className="inline-block py-1.5 px-4 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                    {hero.ctaText}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isUploading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'সেভ হচ্ছে...' : 'ব্যানার ও ছবি সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
