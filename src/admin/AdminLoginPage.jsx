import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, Activity } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, admin } = useAdminAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in → go to dashboard
  if (admin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message || 'ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A13] flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20px 20px, #F59E0B 1.5px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-[#0C1120]/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-8 sm:p-11 w-full max-w-md shadow-2xl shadow-black/80"
      >
        {/* Top real-time badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>⚡ রিয়েল-টাইম সাইট ডেটা ইঞ্জিন</span>
          </div>
        </div>

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="relative w-18 h-18 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl blur-md opacity-40 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 border border-amber-300/40">
              <ShieldCheck className="w-9 h-9 text-slate-950 stroke-[2.5]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Gift Vibes</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 text-lg sm:text-xl font-bold px-2 py-0.5 bg-amber-400/10 rounded-lg border border-amber-400/20">
              Admin
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            উচ্চ ক্ষমতাসম্পন্ন নিয়ন্ত্রণ প্যানেলে সাইন-ইন করুন
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              অ্যাডমিন ইউজারনেম
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="যেমন: Rabbani12"
                className="w-full pl-10 pr-4 py-3 bg-[#070A13] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              গোপন পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[#070A13] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:via-amber-500 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/25 transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>প্যানেলে প্রবেশ করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>সিস্টেম: 1ms Latency</span>
          </span>
          <span>Gift Vibes v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
