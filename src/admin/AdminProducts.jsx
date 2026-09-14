import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import {
  Package,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  Edit2,
  Trash2,
  X,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/site-data');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (_err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStockChange = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(productId);
    try {
      await api.post('/products/stock', { productId, stock: newStock });
      fetchProducts();
    } catch (err) {
      alert('স্টক আপডেট ব্যর্থ: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleInStock = async (product) => {
    setUpdatingId(product.id);
    const newStock = product.inStock ? 0 : (product.stock > 0 ? product.stock : 10);
    try {
      await api.post('/products/stock', { productId: product.id, stock: newStock });
      fetchProducts();
    } catch (err) {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('অনুগ্রহ করে ছবি ফাইল সিলেক্ট করুন (PNG, JPG, JPEG, WebP ইত্যাদি)'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Always convert to WebP format
          let dataUrl = canvas.toDataURL('image/webp', 0.85);
          // Fallback if browser doesn't support WebP canvas encoding
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('ছবি লোড করতে সমস্যা হয়েছে'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setImagePreview(compressedDataUrl);
    } catch (err) {
      alert('ছবি আপলোড ব্যর্থ: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const finalImage = (imagePreview || '').trim() || formData.get('image')?.trim() || (editingProduct?.image || '/images/products/red-maroon.webp');
    const productPayload = {
      ...(editingProduct || {}),
      name: formData.get('name'),
      banglaName: formData.get('banglaName'),
      price: Number(formData.get('price')) || 1350,
      originalPrice: Number(formData.get('originalPrice')) || 1650,
      stock: Number(formData.get('stock')) || 10,
      color: formData.get('color') || 'Multi',
      category: formData.get('category') || 'Handloom',
      image: finalImage,
    };

    try {
      await api.post('/products', productPayload);
      setEditingProduct(null);
      setIsAddingNew(false);
      setImagePreview('');
      fetchProducts();
    } catch (err) {
      alert('প্রডাক্ট সেভ ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই প্রডাক্টটি ডিলিট করতে চান?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert('ডিলিট ব্যর্থ: ' + err.message);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
      (p.color && p.color.toLowerCase().includes(q))
    );
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ─── Header & Action Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">পণ্য ও লাইভ স্টক ম্যানেজার</h2>
          </div>
          <p className="text-xs text-slate-400">
            মোট {products.length}টি শাড়ি কম্বো প্রডাক্ট। স্টক বাড়ানো বা কমালে তা ১-২ সেকেন্ডে কাস্টমারদের সামনে লাইভ আপডেট হয়।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddingNew(true);
              setImagePreview('/images/products/red-maroon.webp');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম বা কালার দিয়ে শাড়ি কম্বো খুঁজুন..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0C1222] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* ─── Products Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((product) => {
          const isUpdating = updatingId === product.id;
          const inStock = Boolean(product.stock > 0 && product.inStock !== false);

          return (
            <div
              key={product.id}
              className={`bg-[#0C1222] border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative group ${
                inStock
                  ? 'border-slate-800 hover:border-amber-500/40 shadow-lg shadow-black/20'
                  : 'border-red-900/40 bg-red-950/10'
              }`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 mb-3.5 border border-slate-800/80">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {product.color || 'শাড়ি কম্বো'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleInStock(product)}
                    className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border cursor-pointer transition-all ${
                      inStock
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {inStock ? '● ইন-স্টক' : '✕ স্টক আউট'}
                  </button>
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-white line-clamp-1">{product.banglaName || product.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{product.name}</p>

                {/* Prices */}
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-base font-black text-amber-400">৳{product.price?.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-500 line-through">৳{product.originalPrice?.toLocaleString()}</span>
                  )}
                  {product.discount && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                      {product.discount}
                    </span>
                  )}
                </div>
              </div>

              {/* ─── Real-Time Stock Control Bar ─── */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">স্টক:</span>
                  <span
                    className={`text-sm font-black px-2 py-0.5 rounded-md ${
                      product.stock <= 5
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {product.stock || 0} টি
                  </span>
                </div>

                {/* Tactile + / - stock buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStockChange(product.id, product.stock || 0, -1)}
                    disabled={isUpdating || (product.stock || 0) <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStockChange(product.id, product.stock || 0, 1)}
                    disabled={isUpdating}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsAddingNew(false);
                      setImagePreview(product.image || '/images/products/red-maroon.webp');
                    }}
                    title="এডিট করুন"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    title="ডিলিট করুন"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Modal for Add / Edit Product ─── */}
      {(isAddingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0C1222] border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingProduct(null);
                setImagePreview('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">
              {editingProduct ? 'শাড়ি কম্বো তথ্য এডিট করুন' : 'নতুন শাড়ি কম্বো যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">বাংলা নাম (স্টোরফ্রন্টে দেখাবে)</label>
                <input
                  name="banglaName"
                  defaultValue={editingProduct?.banglaName || ''}
                  required
                  placeholder="যেমন: রক্তিম লাল ও মেরুন তাঁতের শাড়ি কম্বো"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ইংরেজি নাম</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  placeholder="Handloom Cotton Saree Combo - Red + Maroon"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price || 1350}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">কাটা মূল্য (Original Price)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    defaultValue={editingProduct?.originalPrice || 1650}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">স্টক পরিমাণ (Stock)</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock || 10}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">কালার নাম</label>
                  <input
                    name="color"
                    defaultValue={editingProduct?.color || 'Red + Maroon'}
                    placeholder="Red + Maroon"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* ─── Image Upload (PC & Mobile Gallery) ─── */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>পণ্যের ছবি (PC ও মোবাইল গ্যালারি)</span>
                  </label>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>স্বয়ংক্রিয় WebP কনভার্টার</span>
                  </span>
                </div>

                {/* Hidden Native File Input for Gallery/PC File Picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Image Preview / Upload Box */}
                {imagePreview ? (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3.5">
                    <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/red-maroon.webp';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>ছবি সিলেক্ট করা হয়েছে</span>
                      </p>
                      <p className="text-[10px] text-amber-400/90 font-medium mb-1.5">
                        {imagePreview.startsWith('data:image/webp') ? '⚡ WebP ফরম্যাটে রূপান্তর সম্পন্ন' : '✓ লাইভ ইমেজ'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : 'অন্য ছবি দিন'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePreview('')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>রিমুভ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-4 sm:p-5 text-center transition-all group"
                  >
                    <div className="w-11 h-11 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : '📁 যে কোনো ছবি সিলেক্ট করুন (স্বয়ংক্রিয় WebP হবে)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, JPEG, GIF সব ছবি মুহূর্তেই হালকা ও হাই-কোয়ালিটি WebP তে কনভার্ট হবে
                    </p>
                  </div>
                )}

                {/* Direct Image URL input fallback */}
                <div className="pt-1">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    অথবা সরাসরি ছবির লিংক (Image URL):
                  </label>
                  <input
                    name="image"
                    value={imagePreview}
                    onChange={(e) => setImagePreview(e.target.value)}
                    placeholder="/images/products/red-maroon.webp অথবা https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                    setImagePreview('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
