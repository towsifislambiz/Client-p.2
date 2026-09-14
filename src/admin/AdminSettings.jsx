import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [form, setForm] = useState({
    storeName: '',
    storeTagline: '',
    whatsappNumber: '',
    phone: '',
    email: '',
    address: '',
    bkashNumber: '',
    nagadNumber: '',
    deliveryInsideDhaka: '',
    deliveryOutsideDhaka: '',
    deliveryTime: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/settings')
      .then((data) => {
        const s = data.settings || {};
        setForm({
          storeName: s.storeName || '',
          storeTagline: s.storeTagline || '',
          whatsappNumber: s.whatsappNumber || '',
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          bkashNumber: s.bkashNumber || '',
          nagadNumber: s.nagadNumber || '',
          deliveryInsideDhaka: s.deliveryInsideDhaka ?? 80,
          deliveryOutsideDhaka: s.deliveryOutsideDhaka ?? 130,
          deliveryTime: s.deliveryTime || '',
        });
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      showToast('সেটিংস সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors"
      />
    </div>
  );

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
        <h1 className="text-2xl font-black text-slate-900">স্টোর সেটিংস</h1>
        <p className="text-sm text-slate-500 mt-0.5">ওয়েবসাইটের সকল যোগাযোগ তথ্য ও ডেলিভারি চার্জ পরিবর্তন করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Store Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-3">স্টোরের তথ্য</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="স্টোরের নাম" name="storeName" placeholder="GIFT VIBES" />
            <Field label="ট্যাগলাইন" name="storeTagline" placeholder="Gifts That Create Memories" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-3">যোগাযোগ তথ্য</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ফোন নম্বর" name="phone" placeholder="01828739540" />
            <Field label="হোয়াটসঅ্যাপ নম্বর (দেশ কোড সহ)" name="whatsappNumber" placeholder="8801828739540" />
            <Field label="ইমেইল" name="email" type="email" placeholder="example@gmail.com" />
          </div>
          <Field label="ঠিকানা" name="address" placeholder="148, Arambag, Motijheel, Dhaka-1000" />
        </div>

        {/* Payment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-3">পেমেন্ট তথ্য</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="বিকাশ নম্বর" name="bkashNumber" placeholder="01828739540 (Personal)" />
            <Field label="নগদ নম্বর" name="nagadNumber" placeholder="01828739540 (Personal)" />
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-3">ডেলিভারি চার্জ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="ঢাকার ভেতরে (৳)" name="deliveryInsideDhaka" type="number" placeholder="80" />
            <Field label="ঢাকার বাইরে (৳)" name="deliveryOutsideDhaka" type="number" placeholder="130" />
            <Field label="ডেলিভারি সময়" name="deliveryTime" placeholder="১ - ৩ দিন" />
          </div>
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
