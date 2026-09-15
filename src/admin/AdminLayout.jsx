import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Zap,
  Clock,
} from 'lucide-react';

const toBengaliNumber = (num) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('এখনই');
  const [productCount, setProductCount] = useState(12);

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/site-data');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) setProductCount(data.products.length);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'ড্যাশবোর্ড', badge: null },
    { to: '/admin/products', icon: Package, label: 'পণ্য ও লাইভ স্টক', badge: toBengaliNumber(productCount) },
    { to: '/admin/orders', icon: ShoppingBag, label: 'অর্ডার ট্র্যাকার', badge: 'লাইভ' },
    { to: '/admin/hero', icon: Sparkles, label: 'হিরো ব্যানার CMS', badge: null },
    { to: '/admin/settings', icon: Settings, label: 'স্টোর ও ডেলিভারি', badge: null },
    { to: '/admin/security', icon: Shield, label: 'সিকিউরিটি', badge: null },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A13] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Modern Luxury Sidebar ─── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0C1120] border-r border-slate-800/80 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0C1120] rounded-[10px] flex items-center justify-center">
                <span className="text-base font-black text-amber-400">GV</span>
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white">GIFT VIBES</h1>
              <p className="text-[11px] text-amber-400/80 font-semibold tracking-wide">ল্যাক্সারি কন্ট্রোল প্যানেল</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time status widget */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-300">রিয়েল-টাইম API সক্রিয়</span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {lastSyncTime}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Storefront Link & Admin Footer */}
        <div className="p-4 border-t border-slate-800/70 space-y-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-700/60 hover:border-amber-500/40 transition-all shadow-sm"
          >
            <span>লাইভ স্টোরফ্রন্ট দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 font-black text-xs">
                  {admin?.username?.[0]?.toUpperCase() || 'R'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">{admin?.username}</p>
                <p className="text-[10px] text-amber-400/80 font-medium">অ্যাডমিনিস্ট্রেটর</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="লগআউট"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Container ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0C1120]/80 backdrop-blur-md border-b border-slate-800/70 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Gift Vibes Luxury Storefront Manager</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>রিয়েল-টাইম লাইভ সিঙ্ক সক্রিয় (১-২ সেকেন্ড)</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
            >
              <span>ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
