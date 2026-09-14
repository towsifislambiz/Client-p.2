import React, { useEffect, useState } from 'react';
import { api, apiFetch, API_BASE } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Package, Search, X, Loader2,
  CheckCircle2, AlertCircle, ImagePlus, RefreshCw
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  banglaName: '',
  price: '',
  originalPrice: '',
  description: '',
  itemsList: '',
  category: 'Combo',
  color: '',
  colorCode: '#cc0000',
  stock: 10,
  tags: '',
  imageFile: null,
  imagePreview: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      setProducts(data.products || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const interval = setInterval(() => {
      api.get('/products')
        .then((data) => {
          if (data?.products) setProducts(data.products);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      banglaName: product.banglaName || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      description: product.description || '',
      itemsList: product.itemsList || '',
      category: product.category || 'Combo',
      color: product.color || '',
      colorCode: product.colorCode || '#cc0000',
      stock: product.stock ?? 10,
      tags: product.tags?.join(', ') || '',
      imageFile: null,
      imagePreview: product.image || '',
    });
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({
        ...f,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'imageFile' || key === 'imagePreview') return;
        formData.append(key, val);
      });
      if (form.imageFile) formData.append('image', form.imageFile);

      if (editing) {
        await apiFetch(`/products/${editing._id}`, { method: 'PUT', body: formData });
        showToast('পণ্য আপডেট হয়েছে!');
      } else {
        await apiFetch('/products', { method: 'POST', body: formData });
        showToast('নতুন পণ্য যুক্ত হয়েছে!');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast('পণ্য মুছে ফেলা হয়েছে।');
      setDeleteConfirm(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStockUpdate = async (product, newStock) => {
    try {
      await api.patch(`/products/${product._id}/stock`, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, stock: Number(newStock), inStock: Number(newStock) > 0 } : p
        )
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = products.filter((p) =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.banglaName?.toLowerCase().includes(search.toLowerCase()) ||
    p.color?.toLowerCase().includes(search.toLowerCase())
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
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
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
          <h1 className="text-2xl font-black text-slate-900">পণ্য ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-500">{products.length}টি পণ্য</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadProducts} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            নতুন পণ্য যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="পণ্য সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">ছবি</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">নাম</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">কালার</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">মূল্য</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">স্টক</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{product.banglaName || product.name}</p>
                      <p className="text-slate-400">{product.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-200 shrink-0"
                          style={{ background: product.colorCode || '#cc0000' }}
                        />
                        <span className="text-slate-600">{product.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">৳{product.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={product.stock ?? 0}
                        onChange={(e) => handleStockUpdate(product, e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center text-xs font-bold focus:outline-none focus:border-amber-400"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      {search ? 'কোনো পণ্য পাওয়া যায়নি।' : 'এখনো কোনো পণ্য নেই।'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-base font-black text-slate-900 mb-2">পণ্য মুছবেন?</h3>
              <p className="text-sm text-slate-500 mb-5">এই পণ্যটি স্থায়ীভাবে মুছে যাবে।</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl cursor-pointer"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-900">{editing ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যুক্ত করুন'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">পণ্যের নাম (ইংরেজি) *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">পণ্যের নাম (বাংলা)</label>
                    <input value={form.banglaName} onChange={(e) => setForm({ ...form, banglaName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">মূল্য (৳) *</label>
                    <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">পূর্বের মূল্য (৳)</label>
                    <input type="number" min="0" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">কালার</label>
                    <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="যেমন: Red + Maroon"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">কালার কোড</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                        className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer" />
                      <input value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">স্টক পরিমাণ</label>
                    <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি</label>
                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">বিবরণ</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">আইটেমস লিস্ট</label>
                  <textarea rows={2} value={form.itemsList} onChange={(e) => setForm({ ...form, itemsList: e.target.value })}
                    placeholder="তাঁতের শাড়ি, চুড়ি, গলার সেট..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="saree, combo, gift"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">পণ্যের ছবি</label>
                  <div className="flex items-center gap-4">
                    {form.imagePreview && (
                      <img src={form.imagePreview} alt="preview"
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 transition-colors text-slate-500 text-sm">
                      <ImagePlus className="w-4 h-4" />
                      ছবি আপলোড করুন
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                    বাতিল
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editing ? 'আপডেট করুন' : 'পণ্য যুক্ত করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
