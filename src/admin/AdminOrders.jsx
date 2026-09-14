import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Filter, Loader2, RefreshCw,
  CheckCircle2, AlertCircle, Phone, MapPin, Clock,
  Truck, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const statusConfig = {
  pending:   { label: 'পেন্ডিং',    color: 'text-amber-700 bg-amber-50 border-amber-200',    icon: Clock },
  confirmed: { label: 'কনফার্ম',    color: 'text-blue-700 bg-blue-50 border-blue-200',        icon: CheckCircle2 },
  shipped:   { label: 'শিপড',       color: 'text-purple-700 bg-purple-50 border-purple-200',  icon: Truck },
  delivered: { label: 'ডেলিভার্ড', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'বাতিল',      color: 'text-red-700 bg-red-50 border-red-200',           icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const data = await api.get(`/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      api.get(`/orders?${params}`)
        .then((data) => {
          if (data?.orders) setOrders(data.orders);
          if (data?.pagination) setPagination(data.pagination);
        })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((o) => ({ ...o, status: newStatus }));
      }
      showToast('স্ট্যাটাস আপডেট হয়েছে।');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter((o) =>
    !search ||
    o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
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

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-500">মোট {pagination.total}টি অর্ডার</p>
        </div>
        <button onClick={loadOrders} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="অর্ডার ID, নাম বা ফোন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="">সব স্ট্যাটাস</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">অর্ডার ID</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">কাস্টমার</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">মোট</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">পেমেন্ট</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">স্ট্যাটাস</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">তারিখ</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">বিস্তারিত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{order.orderId}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{order.customer?.name}</p>
                        <p className="text-slate-400">{order.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">৳{order.grandTotal?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          order.customer?.paymentMethod === 'BKASH'
                            ? 'text-pink-700 bg-pink-50 border-pink-200'
                            : 'text-slate-600 bg-slate-50 border-slate-200'
                        }`}>
                          {order.customer?.paymentMethod === 'BKASH' ? 'বিকাশ' : 'COD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className={`text-[10px] font-bold border rounded-full px-2 py-1 cursor-pointer focus:outline-none ${cfg.color}`}
                        >
                          {Object.entries(statusConfig).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-amber-100"
                        >
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">কোনো অর্ডার নেই।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">পেজ {page} / {pagination.pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="font-black text-slate-900">অর্ডার বিস্তারিত</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                {/* Customer */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase">কাস্টমার তথ্য</h3>
                  <p className="font-bold text-slate-900">{selectedOrder.customer?.name}</p>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.customer?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedOrder.customer?.address} ({selectedOrder.customer?.district === 'insideDhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    পেমেন্ট: {selectedOrder.customer?.paymentMethod === 'BKASH' ? `বিকাশ (TrxID: ${selectedOrder.customer?.trxId || 'N/A'})` : 'ক্যাশ অন ডেলিভারি'}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase mb-3">পণ্যসমূহ</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800">{item.banglaName || item.name}</p>
                          {item.selectedColor && <p className="text-xs text-slate-400">কালার: {item.selectedColor}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-xs text-slate-400">x{item.quantity} × ৳{item.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>সাবটোটাল</span>
                    <span>৳{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি ফি</span>
                    <span>৳{selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-slate-900">
                    <span>সর্বমোট</span>
                    <span className="text-amber-600">৳{selectedOrder.grandTotal?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">স্ট্যাটাস পরিবর্তন করুন</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
