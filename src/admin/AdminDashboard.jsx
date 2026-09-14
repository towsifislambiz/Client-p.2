import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAdminAuth } from './AdminAuthContext';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  BanknoteIcon,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'পেন্ডিং', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'কনফার্ম', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  shipped: { label: 'শিপড', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck },
  delivered: { label: 'ডেলিভার্ড', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'বাতিল', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

const MONTH_NAMES = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলা', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, ordersData, productsData] = await Promise.all([
        api.get('/orders/analytics'),
        api.get('/orders?limit=5'),
        api.get('/products'),
      ]);
      setAnalytics(analyticsData.analytics);
      setRecentOrders(ordersData.orders || []);
      setProductCount(productsData.products?.length || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      // Silent background real-time sync with MongoDB
      Promise.all([
        api.get('/orders/analytics'),
        api.get('/orders?limit=5'),
        api.get('/products'),
      ])
        .then(([analyticsData, ordersData, productsData]) => {
          if (analyticsData?.analytics) setAnalytics(analyticsData.analytics);
          if (ordersData?.orders) setRecentOrders(ordersData.orders);
          if (productsData?.products) setProductCount(productsData.products.length);
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold cursor-pointer">
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'মোট রেভিনিউ',
      value: `৳${(analytics?.totalRevenue || 0).toLocaleString()}`,
      icon: BanknoteIcon,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'মোট অর্ডার',
      value: analytics?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      label: 'মোট পণ্য',
      value: productCount,
      icon: Package,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      label: 'এই মাসের অর্ডার',
      value: (() => {
        const now = new Date();
        const thisMonth = analytics?.monthlyRevenue?.find(
          (m) => m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1
        );
        return thisMonth?.count || 0;
      })(),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      iconColor: 'text-amber-600',
    },
  ];

  // Chart data
  const chartMax = Math.max(...(analytics?.monthlyRevenue?.map((m) => m.revenue) || [1]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">ড্যাশবোর্ড</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              রিয়েল-টাইম লাইভ
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">স্বাগতম, {admin?.username}! আপনার স্টোরের সকল লাইভ ডেটা।</p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          রিফ্রেশ
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} className={`bg-white border rounded-2xl p-4 sm:p-5 ${color.split(' ').filter(c => c.startsWith('border')).join(' ')}`}>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${color}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4">মাসিক রেভিনিউ (শেষ ৬ মাস)</h3>
          {analytics?.monthlyRevenue?.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {analytics.monthlyRevenue.map((m) => (
                <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all"
                    style={{ height: `${(m.revenue / chartMax) * 100}%`, minHeight: '4px' }}
                    title={`৳${m.revenue.toLocaleString()}`}
                  />
                  <span className="text-[9px] text-slate-400 font-medium">
                    {MONTH_NAMES[m._id.month - 1]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              এখনো কোনো ডেটা নেই
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4">অর্ডার স্ট্যাটাস</h3>
          <div className="space-y-2.5">
            {(analytics?.statusBreakdown || []).map((s) => {
              const cfg = statusConfig[s._id] || { label: s._id, color: 'text-slate-600 bg-slate-50 border-slate-200' };
              return (
                <div key={s._id} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${cfg.color}`}>
                  <span>{cfg.label}</span>
                  <span className="text-base font-black">{s.count}</span>
                </div>
              );
            })}
            {(analytics?.statusBreakdown || []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">কোনো অর্ডার নেই</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">সাম্প্রতিক অর্ডার</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">অর্ডার ID</th>
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">কাস্টমার</th>
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">মোট</th>
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                return (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{order.orderId}</td>
                    <td className="px-4 py-3 text-slate-600">{order.customer?.name}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">৳{order.grandTotal?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">কোনো অর্ডার নেই</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
