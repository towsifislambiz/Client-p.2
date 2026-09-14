import React, { useState } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
      showToast('নতুন পাসওয়ার্ড দুটো মিলছে না।', 'error');
      return;
    }

    if (form.newPassword.length < 8) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({ label, name, show, onToggle, placeholder }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={show ? 'text' : 'password'}
          required
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-lg">
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
        <h1 className="text-2xl font-black text-slate-900">সিকিউরিটি</h1>
        <p className="text-sm text-slate-500 mt-0.5">অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন</p>
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">নিরাপদ পাসওয়ার্ড ব্যবহার করুন</p>
          <p className="text-xs text-amber-700 mt-1">
            পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে। বড় হাতের অক্ষর, ছোট হাতের অক্ষর, সংখ্যা ও বিশেষ চিহ্ন ব্যবহার করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <PasswordField
          label="বর্তমান পাসওয়ার্ড"
          name="currentPassword"
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          placeholder="আপনার বর্তমান পাসওয়ার্ড"
        />

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <PasswordField
            label="নতুন পাসওয়ার্ড"
            name="newPassword"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="কমপক্ষে ৮ অক্ষর"
          />

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="পাসওয়ার্ড আবার লিখুন"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                  form.confirmPassword && form.confirmPassword !== form.newPassword
                    ? 'border-red-400 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
            </div>
            {form.confirmPassword && form.confirmPassword !== form.newPassword && (
              <p className="text-xs text-red-500 mt-1">পাসওয়ার্ড মিলছে না</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || (form.confirmPassword && form.confirmPassword !== form.newPassword)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-amber-500/25 mt-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              পরিবর্তন হচ্ছে...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              পাসওয়ার্ড পরিবর্তন করুন
            </>
          )}
        </button>
      </form>
    </div>
  );
}
