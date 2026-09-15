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
  Check,
  Flame,
  Ban,
  Palette,
  Layers,
  FileText,
  Percent,
} from 'lucide-react';

const MAX_PRODUCTS = 50;

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bn[Number(d)]);
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [savedSuccessId, setSavedSuccessId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  // Local draft values for inline stock inputs
  const [stockDrafts, setStockDrafts] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/site-data');
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch (_err) {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 2500);
    return () => clearInterval(interval);
  }, []);

  // Sync draft stocks with products
  useEffect(() => {
    const drafts = {};
    products.forEach((p) => {
      drafts[p.id] = p.stock ?? 0;
    });
    setStockDrafts(drafts);
  }, [products]);

  // Real-time Stock Update with Instant Optimistic UI (0ms delay)
  const handleUpdateStockDirect = async (productId, newStock) => {
    const stockVal = Math.max(0, Number(newStock) || 0);
    setUpdatingId(productId);

    // 1. Instant Optimistic local update
    setProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(productId)
          ? { ...p, stock: stockVal, inStock: stockVal > 0 }
          : p
      )
    );
    setStockDrafts((prev) => ({ ...prev, [productId]: stockVal }));

    // 2. Background Server Sync
    try {
      await api.post('/products/stock', { productId, stock: stockVal });
      setSavedSuccessId(productId);
      setTimeout(() => setSavedSuccessId(null), 2000);
      showToast(`স্টক সফলভাবে ${toBengaliNumber(stockVal)} টি সেভ হয়েছে!`);
    } catch (err) {
      alert('স্টক আপডেট ব্যর্থ: ' + err.message);
      fetchProducts(); // revert on error
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStockChangeDelta = (productId, currentStock, delta) => {
    const newStock = Math.max(0, (Number(currentStock) || 0) + delta);
    handleUpdateStockDirect(productId, newStock);
  };

  const handleToggleInStock = async (product) => {
    const newInStock = !product.inStock;
    const newStock = newInStock ? (product.stock > 0 ? product.stock : 10) : 0;
    handleUpdateStockDirect(product.id, newStock);
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

          let dataUrl = canvas.toDataURL('image/webp', 0.85);
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

  // Full Product Save & Edit Handler (Handles all product attributes cleanly)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const rawStock = formData.get('stock');
    const stockVal = rawStock !== '' && rawStock !== null && !isNaN(rawStock) ? Math.max(0, Number(rawStock)) : 10;

    const priceVal = Number(formData.get('price')) || 1350;
    const originalPriceVal = Number(formData.get('originalPrice')) || priceVal;
    const inStockVal = formData.get('inStock') === 'true' || (formData.get('inStock') !== 'false' && stockVal > 0);

    let discountVal = (formData.get('discount') || '').trim();
    if (!discountVal && originalPriceVal > priceVal) {
      const pct = Math.round(((originalPriceVal - priceVal) / originalPriceVal) * 100);
      discountVal = `${pct}% অফ`;
    }

    const finalImage = (imagePreview || '').trim() || formData.get('image')?.trim() || (editingProduct?.image || '/images/products/red-maroon.webp');

    const productPayload = {
      ...(editingProduct || {}),
      name: (formData.get('name') || '').trim() || 'Handloom Cotton Saree Combo',
      banglaName: (formData.get('banglaName') || '').trim() || 'তাঁতের শাড়ি কম্বো',
      tagline: (formData.get('tagline') || '').trim(),
      category: formData.get('category') || 'Handloom',
      color: (formData.get('color') || '').trim() || 'Multi',
      colorCode: (formData.get('colorCode') || '').trim() || '#880808',
      price: priceVal,
      originalPrice: originalPriceVal,
      stock: stockVal,
      inStock: inStockVal,
      discount: discountVal,
      description: (formData.get('description') || '').trim(),
      itemsList: (formData.get('itemsList') || '').trim(),
      image: finalImage,
    };

    if (!editingProduct && products.length >= MAX_PRODUCTS) {
      alert('⚠️ ৫K প্যাকেজ লিমিট পূর্ণ! সর্বোচ্চ ৫০টি পণ্য যোগ করা যাবে। নতুন পণ্য যোগ করতে হলে যেকোনো একটি পুরনো পণ্য ডিলিট করুন।');
      return;
    }

    // 1. Instant Optimistic local update
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(editingProduct.id) ? { ...p, ...productPayload } : p))
      );
    } else {
      const tempNew = { ...productPayload, id: Date.now() };
      setProducts((prev) => [tempNew, ...prev]);
    }

    // Close modal immediately for smooth responsiveness
    setEditingProduct(null);
    setIsAddingNew(false);
    setImagePreview('');
    showToast('পণ্য সফলভাবে সেভ ও লাইভ সাইটে আপডেট হয়েছে!');

    // 2. Background Server Save
    try {
      await api.post('/products', productPayload);
      fetchProducts();
    } catch (err) {
      alert('প্রডাক্ট সেভ ব্যর্থ: ' + err.message);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) return;
    
    // Instant Optimistic delete
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(productId)));
    showToast('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে');

    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert('ডিলিট ব্যর্থ: ' + err.message);
      fetchProducts();
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(q)) ||
      (p.color && p.color.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-950/50 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Action Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C1222] p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">পণ্য ও লাইভ স্টক ম্যানেজার</h2>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ml-2 flex items-center gap-1">
              <span>{toBengaliNumber(products.length)}</span>
              <span className="text-slate-400 font-normal">/</span>
              <span>{toBengaliNumber(MAX_PRODUCTS)}টি</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            মোট {toBengaliNumber(products.length)}টি পণ্য সক্রিয় • ৫K প্যাকেজ: সর্বোচ্চ ৫০টি পণ্য সুবিধা সক্রিয় (বাকি {toBengaliNumber(Math.max(0, MAX_PRODUCTS - products.length))}টি)।
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden md:flex flex-col items-end mr-1">
            <span className="text-[10px] font-bold text-slate-400">
              ক্যাটালগ ব্যবহার: {toBengaliNumber(products.length)}/{toBengaliNumber(MAX_PRODUCTS)} ({Math.round((products.length / MAX_PRODUCTS) * 100)}%)
            </span>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (products.length / MAX_PRODUCTS) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (products.length >= MAX_PRODUCTS) {
                alert('⚠️ ৫K প্যাকেজ লিমিট পূর্ণ! সর্বোচ্চ ৫০টি পণ্য যোগ করা যাবে। নতুন পণ্য যোগ করতে হলে পুরনো পণ্য ডিলিট করুন।');
                return;
              }
              setEditingProduct(null);
              setIsAddingNew(true);
              setImagePreview('/images/products/red-maroon.webp');
            }}
            disabled={products.length >= MAX_PRODUCTS}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
              products.length >= MAX_PRODUCTS
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{products.length >= MAX_PRODUCTS ? '৫০টি লিমিট পূর্ণ' : 'নতুন পণ্য যোগ করুন'}</span>
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
          placeholder="নাম, বাংলা নাম, কালার বা ক্যাটাগরি দিয়ে পণ্য খুঁজুন..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0C1222] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* ─── Products Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((product) => {
          const isUpdating = updatingId === product.id;
          const isSuccess = savedSuccessId === product.id;
          const inStock = Boolean(product.stock > 0 && product.inStock !== false);
          const currentDraft = stockDrafts[product.id] ?? (product.stock ?? 0);

          return (
            <div
              key={product.id}
              className={`bg-[#0C1222] border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative group ${
                inStock
                  ? 'border-slate-800 hover:border-amber-500/40 shadow-lg shadow-black/20'
                  : 'border-red-900/50 bg-red-950/10'
              }`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 mb-3.5 border border-slate-800/80">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !inStock ? 'grayscale-40' : ''
                    }`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/products/red-maroon.webp';
                    }}
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                      {product.colorCode && (
                        <span className="w-2 h-2 rounded-full border border-white/30" style={{ backgroundColor: product.colorCode }} />
                      )}
                      <span>{product.color || 'শাড়ি কম্বো'}</span>
                    </span>
                  </div>

                  {/* Instant In-Stock Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleInStock(product)}
                    disabled={isUpdating}
                    title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                    className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border cursor-pointer transition-all active:scale-95 ${
                      inStock
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/40'
                        : 'bg-red-500/25 text-red-300 border-red-500/50 hover:bg-red-500/40'
                    }`}
                  >
                    {inStock ? '● ইন-স্টক' : '✕ স্টক শেষ'}
                  </button>
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-white line-clamp-1">{product.banglaName || product.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{product.name}</p>
                {product.tagline && (
                  <p className="text-[10.5px] text-amber-300/80 mt-1 line-clamp-1 font-medium">{product.tagline}</p>
                )}

                {/* Prices & Discount */}
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-base font-black text-amber-400">৳{Number(product.price || 0).toLocaleString()}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-slate-500 line-through">৳{Number(product.originalPrice).toLocaleString()}</span>
                  )}
                  {product.discount && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {product.discount}
                    </span>
                  )}
                </div>
              </div>

              {/* ─── Real-Time Stock Inline Editor Control ─── */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold">স্টক:</span>
                    
                    {/* Direct Type-In Stock Input Box */}
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        value={currentDraft}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStockDrafts((prev) => ({ ...prev, [product.id]: v }));
                        }}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val) && val !== product.stock) {
                            handleUpdateStockDirect(product.id, val);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className={`w-16 px-2 py-1 text-center font-black text-xs rounded-lg border focus:outline-none transition-all ${
                          (product.stock || 0) <= 5
                            ? 'bg-red-500/15 border-red-500/40 text-red-300 focus:border-red-400'
                            : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                        }`}
                        title="সরাসরি স্টক লিখে এন্টার চাপুন"
                      />
                      <span className="text-[11px] text-slate-400 ml-1 font-semibold">টি</span>
                    </div>

                    {/* Success Save Checkmark */}
                    {isSuccess && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-in fade-in">
                        <Check className="w-3 h-3" /> সেভড
                      </span>
                    )}
                  </div>

                  {/* Tactile + / - buttons & Edit / Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStockChangeDelta(product.id, product.stock || 0, -1)}
                      disabled={isUpdating || (product.stock || 0) <= 0}
                      title="১টি কমান"
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 transition-all active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChangeDelta(product.id, product.stock || 0, 1)}
                      disabled={isUpdating}
                      title="১টি বাড়ান"
                      className="w-7 h-7 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 transition-all active:scale-90"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsAddingNew(false);
                        setImagePreview(product.image || '/images/products/red-maroon.webp');
                      }}
                      title="সম্পূর্ণ তথ্য এডিট করুন"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="পণ্য ডিলিট করুন"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Fast One-Tap Stock Presets (+5, +10, Stock Out) */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/40 text-[10px]">
                  <span className="text-slate-500 font-medium">কুইক স্টক:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStockChangeDelta(product.id, product.stock || 0, 5)}
                      disabled={isUpdating}
                      className="px-2 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700/60 transition-all cursor-pointer active:scale-95"
                    >
                      +৫ টি
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChangeDelta(product.id, product.stock || 0, 10)}
                      disabled={isUpdating}
                      className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/25 transition-all cursor-pointer active:scale-95"
                    >
                      +১০ টি
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStockDirect(product.id, 0)}
                      disabled={isUpdating || (product.stock || 0) === 0}
                      className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold border border-rose-500/25 transition-all cursor-pointer disabled:opacity-30 active:scale-95"
                    >
                      ০ (স্টক শেষ)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Modal for Add / Edit Product (Full Field Capabilities) ─── */}
      {(isAddingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0C1222] border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 sm:p-7 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingProduct(null);
                setImagePreview('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-5 pr-8">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  <span>{editingProduct ? 'শাড়ি কম্বো তথ্য সম্পাদনা (Edit Product)' : 'নতুন শাড়ি কম্বো যোগ করুন (Add Product)'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  পণ্যটির বিবরণ, মূল্য, স্টক ও ছবি পরিবর্তন করে সরাসরি স্টোরফ্রন্টে লাইভ করুন।
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Bangla & English Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    বাংলা নাম <span className="text-rose-400">*</span> (স্টোরফ্রন্টে বড় করে দেখাবে)
                  </label>
                  <input
                    name="banglaName"
                    defaultValue={editingProduct?.banglaName || ''}
                    required
                    placeholder="যেমন: রক্তিম লাল ও মেরুন তাঁতের শাড়ি কম্বো"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    ইংরেজি নাম <span className="text-rose-400">*</span> (ক্যাটালগ সার্চ ও ইনভয়েসের জন্য)
                  </label>
                  <input
                    name="name"
                    defaultValue={editingProduct?.name || ''}
                    required
                    placeholder="Handloom Cotton Saree Combo - Red + Maroon"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  ট্যাগলাইন / সাবটাইটেল (ঐচ্ছিক)
                </label>
                <input
                  name="tagline"
                  defaultValue={editingProduct?.tagline || ''}
                  placeholder="যেমন: ঐতিহ্যবাহী লাল পাড় তাঁতের শাড়ি ও ১১-ইন-১ গিফট সেট"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Prices, Stock & In-Stock Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">বিক্রয় মূল্য (৳) <span className="text-rose-400">*</span></label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct ? editingProduct.price : 1350}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কাটা মূল্য (৳)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    defaultValue={editingProduct ? editingProduct.originalPrice : 1650}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">স্টক পরিমাণ <span className="text-rose-400">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct !== null && typeof editingProduct?.stock !== 'undefined' ? editingProduct.stock : 10}
                    required
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">স্ট্যাটাস</label>
                  <select
                    name="inStock"
                    defaultValue={editingProduct ? String(editingProduct.inStock !== false && editingProduct.stock > 0) : 'true'}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="true">ইন-স্টক (Active)</option>
                    <option value="false">স্টক শেষ (Sold Out)</option>
                  </select>
                </div>
              </div>

              {/* Category, Color Name, Color Code & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">ক্যাটাগরি</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'Red & Maroon'}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Red & Maroon">রক্তিম লাল ও মেরুন</option>
                    <option value="White & Classic">শুভ্র সাদা কালেকশন</option>
                    <option value="Blue & Royal">অভিজাত রয়্যাল ব্লু</option>
                    <option value="Pink & Purple">রানি পিঙ্ক ও পার্পল</option>
                    <option value="Black & Vibrant">ব্ল্যাক ও ভাইব্রেন্ট</option>
                    <option value="Special Combo">স্পেশাল কম্বো</option>
                    <option value="Handloom">ঐতিহ্যবাহী তাঁতের শাড়ি</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কালার নাম</label>
                  <input
                    name="color"
                    defaultValue={editingProduct?.color || 'Red + Maroon'}
                    placeholder="যেমন: Red + Maroon"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">কালার কোড (Hex)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      defaultValue={editingProduct?.colorCode || '#880808'}
                      onChange={(e) => {
                        const txt = document.getElementById('colorCodeInput');
                        if (txt) txt.value = e.target.value;
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer p-0.5"
                    />
                    <input
                      id="colorCodeInput"
                      name="colorCode"
                      defaultValue={editingProduct?.colorCode || '#880808'}
                      placeholder="#880808"
                      className="w-full px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ডিসকাউন্ট ব্যাজ</label>
                  <input
                    name="discount"
                    defaultValue={editingProduct?.discount || ''}
                    placeholder="যেমন: ১৮% অফ (খালি রাখলে অটো হবে)"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items List (11-in-1 items description) */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  প্যাকেজে অন্তর্ভুক্ত আইটেমসমূহ (Items Included)
                </label>
                <input
                  name="itemsList"
                  defaultValue={
                    editingProduct?.itemsList ||
                    'তাঁতের শাড়ি • চুড়ি • গলার সেট • কানের দুল • টিকলি • গাজরা • কাঠগোলাপ • বো ক্লিপ • টিপ • চিরকুট • গিফ্ট বক্স'
                  }
                  placeholder="তাঁতের শাড়ি • চুড়ি • গলার সেট..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  পণ্যের বিস্তারিত বিবরণ (Full Description)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    editingProduct?.description ||
                    'একটি প্রিমিয়াম কোয়ালিটির তাঁতে বোনা সুতির শাড়ি, ম্যাচিং চুড়ি, জমকালো গলার সেট, কানের দুল, টিকলি, সুবাসিত গাজরা, কাঠগোলাপ হেয়ারক্লিপ, সাটিন বো ক্লিপ, টিপ, ভালোবাসার কার্ড/চিরকুট এবং আকর্ষণীয় গিফ্ট বক্স—প্রিয় মানুষকে উপহার দিয়ে মুখে হাসি ফোটানোর সম্পূর্ণ ১১-ইন-১ রাজকীয় প্যাকেজ!'
                  }
                  placeholder="পণ্যটির বিস্তারিত বিবরণ লিখুন..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* ─── Image Upload (PC & Mobile Gallery) ─── */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>পণ্যের ছবি (PC ও মোবাইল গ্যালারি)</span>
                  </label>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>স্বয়ংক্রিয় WebP রূপান্তর</span>
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3.5">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
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
                      <p className="font-bold text-white truncate mb-1 flex items-center gap-1">
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
                          className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : 'অন্য ছবি দিন'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePreview('')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold flex items-center gap-1 transition-all cursor-pointer"
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
                    className="cursor-pointer border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-4 text-center transition-all group"
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-white group-hover:text-amber-300 transition-colors">
                      {isUploading ? 'WebP তে রূপান্তর হচ্ছে...' : '📁 যে কোনো ছবি সিলেক্ট করুন (স্বয়ংক্রিয় WebP হবে)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      গ্যালারি বা পিসি থেকে যে কোনো সাইজের ছবি দিন—মুহূর্তেই অপ্টিমাইজড WebP হয়ে যাবে
                    </p>
                  </div>
                )}

                <div className="pt-1">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    অথবা সরাসরি ছবির লিংক (Image URL):
                  </label>
                  <input
                    name="image"
                    value={imagePreview}
                    onChange={(e) => setImagePreview(e.target.value)}
                    placeholder="/images/products/red-maroon.webp অথবা https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                    setImagePreview('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সংরক্ষণ ও লাইভ আপডেট (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
