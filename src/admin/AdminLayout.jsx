import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/admin/products', icon: Package, label: 'পণ্য ম্যানেজমেন্ট' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'অর্ডার ম্যানেজমেন্ট' },
  { to: '/admin/hero', icon: Image, label: 'হিরো ব্যানার CMS' },
  { to: '/admin/settings', icon: Settings, label: 'স্টোর সেটিংস' },
  { to: '/admin/security', icon: Shield, label: 'সিকিউরিটি' },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!admin) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* ─── Sidebar ─── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-40 transform transition-transform duration-300 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/60">
          <div>
            <h2 className="text-base font-black text-amber-400 tracking-tight">GIFT VIBES</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <span className="text-amber-400 font-black text-xs">
                {admin?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{admin?.username}</p>
              <p className="text-[10px] text-slate-400">{admin?.role || 'admin'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-black text-slate-900">Gift Vibes Admin</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
