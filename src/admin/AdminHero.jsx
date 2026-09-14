import React, { useEffect, useState } from 'react';
import { api, apiFetch } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, CheckCircle2, AlertCircle, ImagePlus } from 'lucide-react';

export default function AdminHero() {
  const [form, setForm] = useState({
    badgeText: '',
    headlineMain: '',
    headlineSub: '',
    subHeadline: '',
    description: '',
    ctaText: '',
    ctaSubText: '',
    desktopImageFile: null,
    desktopImagePreview: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/hero')
      .then((data) => {
        const h = data.hero || {};
        setForm((f) => ({
          ...f,
          badgeText: h.badgeText || '',
          headlineMain: h.headlineMain || '',
          headlineSub: h.headlineSub || '',
          subHeadline: h.subHeadline || '',
          description: h.description || '',
          ctaText: h.ctaText || '',
          ctaSubText: h.ctaSubText || '',
          desktopImagePreview: h.desktopImage || '',
        }));
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({
        ...f,
        desktopImageFile: file,
        desktopImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const fields = ['badgeText', 'headlineMain', 'headlineSub', 'subHeadline', 'description', 'ctaText', 'ctaSubText'];
      fields.forEach((key) => formData.append(key, form[key]));
      if (form.desktopImageFile) formData.append('desktopImage', form.desktopImageFile);

      await apiFetch('/hero', { method: 'PUT', body: formData });
      showToast('হিরো কন্টেন্ট সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold ${
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-black text-slate-900">হিরো ব্যানার CMS</h1>
        <p className="text-sm text-slate-500 mt-0.5">ওয়েবসাইটের প্রধান ব্যানারের টেক্সট ও ছবি পরিবর্তন করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ব্যাজ টেক্সট</label>
          <input
            value={form.badgeText}
            onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            placeholder="✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কম্বো"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">মূল হেডলাইন (লাইন ১)</label>
            <input
              value={form.headlineMain}
              onChange={(e) => setForm({ ...form, headlineMain: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              placeholder="তাঁতে বোনা সুতির শাড়ি"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">হেডলাইন (লাইন ২)</label>
            <input
              value={form.headlineSub}
              onChange={(e) => setForm({ ...form, headlineSub: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              placeholder="কম্বো গিফট সেট"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">সাব-হেডলাইন</label>
          <input
            value={form.subHeadline}
            onChange={(e) => setForm({ ...form, subHeadline: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            placeholder="প্রিয়জনকে সেরা উপহার দিন"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">বিবরণ</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"
            placeholder="হাতে বোনা খাঁটি তাঁতের শাড়ি সহ ১১টি লাক্সারি আইটেমের পূর্ণ কম্বো সেট।"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">CTA বাটন টেক্সট</label>
            <input
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              placeholder="অর্ডার করতে চাই"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">CTA সাব-টেক্সট</label>
            <input
              value={form.ctaSubText}
              onChange={(e) => setForm({ ...form, ctaSubText: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              placeholder="কালার সিলেক্ট করে সরাসরি অর্ডার করুন"
            />
          </div>
        </div>

        {/* Desktop Image */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">ডেস্কটপ হিরো ছবি (ঐচ্ছিক)</label>
          <div className="flex items-center gap-4">
            {form.desktopImagePreview && (
              <img
                src={form.desktopImagePreview.startsWith('blob:') ? form.desktopImagePreview : `http://localhost:5000${form.desktopImagePreview}`}
                alt="Hero preview"
                className="w-24 h-16 object-cover rounded-xl border border-slate-200"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 transition-colors text-slate-500 text-sm">
              <ImagePlus className="w-4 h-4" />
              ছবি আপলোড করুন
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">সর্বোচ্চ ৫ MB। JPG, PNG, WebP সাপোর্টেড।</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-amber-500/25"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
        </button>
      </form>
    </div>
  );
}
