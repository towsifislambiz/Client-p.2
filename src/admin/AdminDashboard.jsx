import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAdminAuth } from './AdminAuthContext';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Phone,
  MessageCircle,
} from 'lucide-react';

const toBengaliNumber = (num) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveSiteData = async () => {
    try {
      const res = await fetch('/api/site-data');
      if (res.ok) {
        const data = await res.json();
        setSiteData(data);
      }
    } catch (_err) {
      // offline fallback
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveSiteData();
    // 2-second real-time auto sync
    const interval = setInterval(fetchLiveSiteData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickStock = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    // Optimistic update
    setSiteData((prev) => {
      if (!prev || !prev.products) return prev;
      return {
        ...prev,
        products: prev.products.map((p) =>
          String(p.id) === String(productId)
            ? { ...p, stock: newStock, inStock: newStock > 0 }
            : p
        ),
      };
    });

    try {
      await api.post('/products/stock', { productId, stock: newStock });
      fetchLiveSiteData();
    } catch (err) {
      alert('স্টক আপডেট ব্যর্থ: ' + err.message);
      fetchLiveSiteData();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistic update
    setSiteData((prev) => {
      if (!prev || !prev.orders) return prev;
      return {
        ...prev,
        orders: prev.orders.map((o) =>
          String(o.id) === String(orderId) ? { ...o, status: newStatus } : o
        ),
      };
    });

    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchLiveSiteData();
    } catch (err) {
      alert('স্ট্যাটাস আপডেট ব্যর্থ: ' + err.message);
      fetchLiveSiteData();
    }
  };

  const orders = siteData?.orders || [];
  const products = siteData?.products || [];
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const pendingCount = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length;
  const deliveredCount = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5);

  if (loading && !siteData) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ─── Top Welcome & Real-Time Sync Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-[#0E1528] to-slate-900/90 p-5 sm:p-7 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              রিয়েল-টাইম সেন্ট্রাল ড্যাশবোর্ড
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ১-২ সে. লাইভ সিঙ্ক
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            স্বাগতম, {admin?.username || 'অ্যাডমিন'}! 👑
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            আপনার শাড়ি স্টোরের প্রতিটি অর্ডার, স্টক এবং সেটিংস রিয়েল-টাইমে পর্যবেক্ষণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchLiveSiteData();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>পণ্য ও স্টক</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─── 5 Metric Cards Grid (including 5K Product Limit) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {/* Total Products (5K Catalog Limit) */}
        <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">মোট পণ্য (5K প্যাকেজ)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {toBengaliNumber(products.length)}
              </h3>
              <span className="text-xs font-bold text-slate-400">/ ৫০টি</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (products.length / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
              <span>আরও {toBengaliNumber(Math.max(0, 50 - products.length))}টি যোগ করা যাবে</span>
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/40 transition-all duration-300 shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">সর্বমোট বিক্রয় (Revenue)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ৳{totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> মোট {orders.length}টি অর্ডার থেকে
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/40 transition-all duration-300 shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">মোট কাস্টমার অর্ডার</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {orders.length}
            </h3>
            <p className="text-[11px] text-amber-400 font-semibold mt-1">
              সরাসরি ডাটাবেজ থেকে লাইভ ট্র্যাক
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/40 transition-all duration-300 shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">পেন্ডিং অর্ডার (Pending)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {pendingCount}
            </h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-1">
              ডেলিভারির জন্য অপেক্ষায়
            </p>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 shadow-lg relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">সফল ডেলিভারি (Delivered)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {deliveredCount}
            </h3>
            <p className="text-[11px] text-purple-400 font-semibold mt-1">
              সফলভাবে কাস্টমার গ্রহণ করেছে
            </p>
          </div>
        </div>
      </div>

      {/* ─── Low Stock Live Alert Widget ─── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">স্টক সতর্কতা (Low Stock Alert)</h4>
              <p className="text-xs text-slate-400">নিচের পণ্যগুলোর স্টক ৫ বা তার চেয়ে কম বাকি আছে। দ্রুত স্টক বাড়িয়ে নিন:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#0C1120] border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{p.banglaName || p.name}</p>
                    <p className="text-[10px] text-amber-400 font-bold">স্টকে বাকি: {p.stock}টি</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQuickStock(p.id, p.stock, 5)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer"
                  >
                    +৫ টি
                  </button>
                  <button
                    onClick={() => handleQuickStock(p.id, p.stock, 10)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold cursor-pointer"
                  >
                    +১০ টি
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Orders Live Board ─── */}
      <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-white">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
            <p className="text-xs text-slate-400 mt-0.5">রিয়েল-টাইমে আসা সর্বশেষ গ্রাহক অর্ডারসমূহ</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>সব অর্ডার দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">এখনো কোনো অর্ডার জমা পড়েনি</p>
            <p className="text-xs text-slate-500 mt-1">কাস্টমার সাইট থেকে অর্ডার করলে এখানে সাথে সাথে ভেসে উঠবে</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">অর্ডার আইডি ও তারিখ</th>
                  <th className="py-3 px-3">গ্রাহক তথ্য</th>
                  <th className="py-3 px-3">পণ্যসমূহ</th>
                  <th className="py-3 px-3">মোট মূল্য</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 5).map((order) => {
                  const statusColors = {
                    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };
                  const currentStatus = (order.status || 'pending').toLowerCase();

                  return (
                    <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-amber-400 block">{order.id}</span>
                        <span className="text-[10px] text-slate-500">{order.date}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-white block">{order.customer?.name}</span>
                        <span className="text-slate-400 block">{order.customer?.phone}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">
                          {order.customer?.address}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          {(order.items || []).map((item, idx) => (
                            <span key={idx} className="block text-slate-300 font-medium">
                              • {item.banglaName || item.name} {item.selectedColor ? `(${item.selectedColor})` : ''} x{item.quantity || 1}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-black text-emerald-400 text-sm block">
                          ৳{(Number(order.grandTotal) || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {order.customer?.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online / bKash'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-[#0C1120] cursor-pointer focus:outline-none ${
                            statusColors[currentStatus] || statusColors.pending
                          }`}
                        >
                          <option value="Pending">পেন্ডিং (Pending)</option>
                          <option value="Processing">প্রসেসিং (Processing)</option>
                          <option value="Delivered">ডেলিভার্ড (Delivered)</option>
                          <option value="Cancelled">বাতিল (Cancelled)</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {order.customer?.phone && (
                          <a
                            href={`https://wa.me/88${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `হ্যালো ${order.customer.name}, Gift Vibes থেকে আপনার অর্ডার #${order.id} কনফার্ম করার জন্য যোগাযোগ করছি।`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
