import React, { useState } from 'react';
import { api } from '../api/client';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Key } from 'lucide-react';

export default function AdminSecurity() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showToast('নতুন পাসওয়ার্ড দুটি মিলছে না।', 'error');
      return;
    }

    if (form.newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-xl animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white">অ্যাডমিন সিকিউরিটি</h2>
        </div>
        <p className="text-xs text-slate-400">
          আপনার অ্যাডমিন একাউন্টের পাসওয়ার্ড সুরক্ষিত রাখুন ও প্রয়োজনে পরিবর্তন করুন।
        </p>
      </div>

      {/* Security Form */}
      <form onSubmit={handleSubmit} className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">বর্তমান পাসওয়ার্ড</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="বর্তমান পাসওয়ার্ড দিন"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">নতুন পাসওয়ার্ড</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          <Shield className="w-4 h-4" />
          <span>{saving ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
        </button>
      </form>
    </div>
  );
}
