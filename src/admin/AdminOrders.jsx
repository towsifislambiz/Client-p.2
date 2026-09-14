import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/site-data');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (_err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ: ' + err.message);
    }
  };

  const statusConfigs = {
    pending: { label: 'পেন্ডিং', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    processing: { label: 'প্রসেসিং', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    delivered: { label: 'ডেলিভার্ড', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    cancelled: { label: 'বাতিল', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const filtered = orders.filter((o) => {
    const statusMatch = filter === 'all' || (o.status || 'Pending').toLowerCase() === filter.toLowerCase();
    const q = search.toLowerCase();
    const queryMatch =
      !q ||
      o.id?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.customer?.address?.toLowerCase().includes(q);
    return statusMatch && queryMatch;
  });

  const pendingCount = orders.filter((o) => (o.status || 'Pending').toLowerCase() === 'pending').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">রিয়েল-টাইম অর্ডার ট্র্যাকার</h2>
          </div>
          <p className="text-xs text-slate-400">
            মোট {orders.length}টি অর্ডার রেকর্ড করা হয়েছে। নতুন অর্ডার প্লেস হলে ১-২ সেকেন্ডে এই তালিকায় যোগ হবে।
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {[
            { key: 'all', label: 'সব অর্ডার', count: orders.length },
            { key: 'pending', label: 'পেন্ডিং', count: pendingCount },
            { key: 'processing', label: 'প্রসেসিং' },
            { key: 'delivered', label: 'ডেলিভার্ড' },
            { key: 'cancelled', label: 'বাতিল' },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === key
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {label} {typeof count === 'number' && `(${count})`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="অর্ডার আইডি, কাস্টমার নাম, বা ফোন নম্বর দিয়ে সার্চ করুন..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0C1222] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* ─── Orders List ─── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0C1222] rounded-2xl border border-dashed border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">কাস্টমার সাইট থেকে অর্ডার করলে এখানে সাথে সাথে দেখা যাবে</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const currentStatus = (order.status || 'Pending').toLowerCase();
            const config = statusConfigs[currentStatus] || statusConfigs.pending;

            return (
              <div
                key={order.id}
                className="bg-[#0C1222] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-lg"
              >
                {/* Top bar of order card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      #{order.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">স্ট্যাটাস:</span>
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border bg-[#090D16] cursor-pointer focus:outline-none ${config.bg} ${config.text} ${config.border}`}
                    >
                      <option value="Pending">পেন্ডিং (Pending)</option>
                      <option value="Processing">প্রসেসিং (Processing)</option>
                      <option value="Delivered">ডেলিভার্ড (Delivered)</option>
                      <option value="Cancelled">বাতিল (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* Body: Customer & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                  {/* Customer Info */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">গ্রাহকের তথ্য</span>
                    <p className="text-sm font-bold text-white">{order.customer?.name}</p>
                    <p className="text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <a href={`tel:${order.customer?.phone}`} className="hover:underline">{order.customer?.phone}</a>
                    </p>
                    <p className="text-slate-400 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{order.customer?.address} ({order.customer?.district === 'insideDhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</span>
                    </p>
                  </div>

                  {/* Products ordered */}
                  <div className="space-y-2 text-xs md:col-span-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">অর্ডারের পণ্যসমূহ</span>
                    <div className="space-y-1.5">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300">
                          <span>
                            • {item.banglaName || item.name} {item.selectedColor ? `(${item.selectedColor})` : ''} x{item.quantity || 1}
                          </span>
                          <span className="font-bold text-white">৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Action */}
                  <div className="space-y-2 text-xs flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 md:pl-5 pt-3 md:pt-0">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">পেমেন্ট ও সর্বমোট</span>
                      <p className="text-lg font-black text-emerald-400 mt-1">
                        ৳{(Number(order.grandTotal) || 0).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        কুরিয়ার ফি: ৳{order.deliveryFee || 0} | পদ্ধতি: {order.customer?.paymentMethod === 'COD' ? 'Cash on Delivery' : `bKash (TrxID: ${order.customer?.trxId || 'N/A'})`}
                      </p>
                    </div>

                    {/* WhatsApp Customer direct button */}
                    {order.customer?.phone && (
                      <a
                        href={`https://wa.me/88${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `হ্যালো ${order.customer.name}, Gift Vibes থেকে আপনার অর্ডার #${order.id} (৳${order.grandTotal}) সংক্রান্ত বিষয়ে যোগাযোগ করছি। ডেলিভারি লোকেশন কনফার্ম করবেন কি?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>গ্রাহককে WhatsApp-এ মেসেজ দিন</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
