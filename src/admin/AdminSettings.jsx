import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Settings,
  Save,
  CheckCircle2,
  Truck,
  Phone,
  MessageSquare,
  CreditCard,
  Building,
  Sparkles,
  RefreshCw,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'GIFT VIBES',
    storeTagline: 'Gifts That Create Memories',
    whatsappNumber: '8801828739540',
    phone: '01828739540',
    email: 'rabbanimeheraj03@gmail.com',
    address: '148, Arambag, Motijheel, Dhaka- 1000',
    bkashNumber: '01828739540 (Personal)',
    nagadNumber: '01828739540 (Personal)',
    deliveryCharges: {
      insideDhaka: 80,
      outsideDhaka: 130,
    },
    deliveryTime: '১ - ৩ দিন',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/site-data')
      .then((r) => r.json())
      .then((data) => {
        if (data.storeSettings) {
          setSettings((prev) => ({
            ...prev,
            ...data.storeSettings,
            deliveryCharges: {
              insideDhaka: data.storeSettings.deliveryCharges?.insideDhaka ?? 80,
              outsideDhaka: data.storeSettings.deliveryCharges?.outsideDhaka ?? 130,
            },
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  const handleDeliveryChange = (field, val) => {
    setSettings((prev) => ({
      ...prev,
      deliveryCharges: {
        ...prev.deliveryCharges,
        [field]: Number(val) || 0,
      },
    }));
    setSavedSuccess(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const webpData = canvas.toDataURL('image/webp', 0.9);
        setSettings((prev) => ({ ...prev, logo: webpData, logoIcon: webpData }));
        setSavedSuccess(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.post('/site-data/update', { storeSettings: settings });
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
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">স্টোর ও ডেলিভারি সেটিংস</h2>
          </div>
          <p className="text-xs text-slate-400">
            এখানে কোনো তথ্য বা ডেলিভারি ফি পরিবর্তন করলে ১-২ সেকেন্ডে মূল ওয়েবসাইটে তা প্রতিফলিত হবে।
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
        {/* Left 2 Cols: Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* General Information */}
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building className="w-4 h-4 text-amber-400" />
              <span>স্টোর পরিচিতি</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">স্টোরের নাম</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">স্টোর ট্যাগলাইন</label>
                <input
                  type="text"
                  value={settings.storeTagline}
                  onChange={(e) => handleChange('storeTagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">অফিস / শপ ঠিকানা</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Store Logo (Automatic WebP) */}
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>স্টোর লোগো (স্বয়ংক্রিয় WebP রূপান্তর)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0">
                <img
                  src={settings.logo || '/images/logo.webp'}
                  alt="Logo Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4" />
                  <span>নতুন লোগো আপলোড করুন</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  যে কোনো ফরম্যাটের ছবি (PNG, JPG, JPEG) সিলেক্ট করলে তা স্বয়ংক্রিয়ভাবে হাই-কোয়ালিটি WebP তে রূপান্তরিত হয়ে ওয়েবসাইটে সেট হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Charges (Very Important!) */}
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>ডেলিভারি চার্জ ও কুরিয়ার ফি</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-amber-300 block mb-1.5">ঢাকার ভেতরে ডেলিভারি চার্জ (৳)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">৳</span>
                  <input
                    type="number"
                    value={settings.deliveryCharges?.insideDhaka}
                    onChange={(e) => handleDeliveryChange('insideDhaka', e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">চেকআউটে ঢাকার কাস্টমারদের জন্য স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-amber-300 block mb-1.5">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">৳</span>
                  <input
                    type="number"
                    value={settings.deliveryCharges?.outsideDhaka}
                    onChange={(e) => handleDeliveryChange('outsideDhaka', e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">চেকআউটে ঢাকার বাইরের কাস্টমারদের জন্য স্বয়ংক্রিয়ভাবে প্রযোজ্য হবে</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">আনুমানিক ডেলিভারি সময়</label>
              <input
                type="text"
                value={settings.deliveryTime}
                onChange={(e) => handleChange('deliveryTime', e.target.value)}
                placeholder="যেমন: ১ - ৩ দিন"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Contact & Payment Numbers */}
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>যোগাযোগ ও পেমেন্ট নম্বর</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">অফিসিয়াল WhatsApp নম্বর (দেশের কোড সহ)</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  placeholder="8801828739540"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">সরাসরি ফোন নম্বর</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="01828739540"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">বিকাশ পেমেন্ট নম্বর</label>
                <input
                  type="text"
                  value={settings.bkashNumber}
                  onChange={(e) => handleChange('bkashNumber', e.target.value)}
                  placeholder="01828739540 (Personal)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">নগদ পেমেন্ট নম্বর</label>
                <input
                  type="text"
                  value={settings.nagadNumber}
                  onChange={(e) => handleChange('nagadNumber', e.target.value)}
                  placeholder="01828739540 (Personal)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Preview & Submit Card */}
        <div className="space-y-5">
          <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg sticky top-20">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>লাইভ প্রিভিউ (Customer View)</span>
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">স্টোর নাম</span>
                <span className="text-base font-black text-amber-400">{settings.storeName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">ট্যাগলাইন</span>
                <span className="text-slate-300 font-medium">{settings.storeTagline}</span>
              </div>

              <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">ঢাকা ভিতরে</span>
                  <span className="text-sm font-bold text-white">৳{settings.deliveryCharges?.insideDhaka}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ঢাকা বাইরে</span>
                  <span className="text-sm font-bold text-white">৳{settings.deliveryCharges?.outsideDhaka}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 block">হোয়াটসঅ্যাপ ও ফোন</span>
                <span className="text-xs font-bold text-emerald-400">{settings.whatsappNumber}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'সেভ হচ্ছে...' : 'পরিবর্তন লাইভ সেভ করুন'}</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              সেভ করার সাথে সাথে ১-২ সেকেন্ডে সাইটের গ্রাহকদের সামনে আপডেট হয়ে যাবে।
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
