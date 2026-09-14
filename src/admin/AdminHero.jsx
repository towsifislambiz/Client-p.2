import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Sparkles, Save, CheckCircle2, Eye } from 'lucide-react';

export default function AdminHero() {
  const [hero, setHero] = useState({
    badge: '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কালেকশন',
    headlineMain: 'তাঁতে বোনা সুতির শাড়ি কম্বো গিফট সেট',
    headlineSub: 'প্রিয় মানুষের মুখে হাসি ফোটানোর সম্পূর্ণ ১১-ইন-১ রাজকীয় উপহার প্যাকেজ',
    offerText: 'সীমিত সময়ের জন্য ১৮% বিশেষ মূল্যছাড়!',
    ctaText: 'পছন্দের কম্বো অর্ডার করুন',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/site-data')
      .then((r) => r.json())
      .then((data) => {
        if (data.hero) {
          setHero((prev) => ({ ...prev, ...data.hero }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, val) => {
    setHero((prev) => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
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
            <h2 className="text-xl sm:text-2xl font-black text-white">হিরো ব্যানার CMS</h2>
          </div>
          <p className="text-xs text-slate-400">
            ওয়েবসাইটের প্রধান টপ ব্যানারের টেক্সট ও অফার কন্টেন্ট এখান থেকে পরিবর্তন করুন।
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>সফলভাবে সেভ হয়েছে ও লাইভ সাইটে প্রযোজ্য!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-2 bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
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
              <span>ব্যানার প্রিভিউ</span>
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs text-center">
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

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'সেভ হচ্ছে...' : 'ব্যানার সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
