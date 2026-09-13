import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import TrustBar from './components/TrustBar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CustomerReviews from './components/CustomerReviews';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPanelModal from './components/AdminPanelModal';
import LiveSalesNotification from './components/LiveSalesNotification';
import FloatingWhatsappButton from './components/FloatingWhatsappButton';
import Footer from './components/Footer';

import { INITIAL_PRODUCTS } from './data/products';
import { STORE_CONFIG } from './data/storeConfig';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function App() {
  // Initialize products from LocalStorage to persist real deletions, additions & live stock
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('giftvibes_store_products_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Save products to LocalStorage whenever modified
  useEffect(() => {
    localStorage.setItem('giftvibes_store_products_v4', JSON.stringify(products));
  }, [products]);

  // Initialize cart from LocalStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('giftvibes_store_cart_v1');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Save cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('giftvibes_store_cart_v1', JSON.stringify(cartItems));
  }, [cartItems]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Pagination state: Exactly 8 products visible by default (4 + 4). Steps by 4.
  const [visibleCount, setVisibleCount] = useState(8);

  // Modals & Drawers State
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filter products by category and smart bilingual (Bangla + English/Banglish) search query
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
    const banglaNameMatch = p.banglaName ? p.banglaName.toLowerCase().includes(q) : false;
    const colorMatch = p.color ? p.color.toLowerCase().includes(q) : false;
    const catMatch = p.category ? p.category.toLowerCase().includes(q) : false;
    const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
    const tagMatch = p.tags ? p.tags.some((t) => t.toLowerCase().includes(q)) : false;

    return matchesCat && (nameMatch || banglaNameMatch || colorMatch || catMatch || descMatch || tagMatch);
  });

  // Displayed products subset for pagination
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Reset pagination to 8 when category or search changes
  useEffect(() => {
    setVisibleCount(8);
  }, [activeCategory, searchQuery]);

  // Live Stock Deduction Function (when an order is placed)
  const handleDeductStock = (orderedItems) => {
    if (!orderedItems || !orderedItems.length) return;
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const match = orderedItems.find((item) => item.id === p.id);
        if (match) {
          const qty = match.quantity || 1;
          const currentStock = typeof p.stock === 'number' ? p.stock : 10;
          const remainingStock = Math.max(0, currentStock - qty);
          return {
            ...p,
            stock: remainingStock,
            inStock: remainingStock > 0,
          };
        }
        return p;
      });
    });
  };

  // Admin Live Stock Update Function
  const handleUpdateStock = (productId, newStock) => {
    const stockNum = Math.max(0, Number(newStock) || 0);
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, stock: stockNum, inStock: stockNum > 0 } : p
      )
    );
  };

  // Cart Handler Functions (Stock-aware & Color-aware)
  const handleAddToCart = (product) => {
    const currentStock = typeof product.stock === 'number' ? product.stock : 10;
    if (currentStock <= 0 || product.inStock === false) {
      alert('দুঃখিত, এই কম্বোটির স্টক শেষ হয়ে গেছে!');
      return;
    }

    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.selectedColor === product.selectedColor
    );

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity || 1;
      if (currentQty + (product.quantity || 1) > currentStock) {
        alert(`দুঃখিত, স্টকে আর মাত্র ${currentStock}টি বাকি আছে!`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity = currentQty + (product.quantity || 1);
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...product, quantity: product.quantity || 1, stock: currentStock }]);
    }

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (item, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(item);
      return;
    }
    const currentStock = typeof item.stock === 'number' ? item.stock : 10;
    if (newQty > currentStock) {
      alert(`দুঃখিত, স্টকে আর মাত্র ${currentStock}টি বাকি আছে!`);
      return;
    }
    const updated = cartItems.map((cartItem) => {
      if (cartItem.id === item.id && cartItem.selectedColor === item.selectedColor) {
        return { ...cartItem, quantity: newQty };
      }
      return cartItem;
    });
    setCartItems(updated);
  };

  const handleRemoveItem = (item) => {
    setCartItems(cartItems.filter((i) => !(i.id === item.id && i.selectedColor === item.selectedColor)));
  };

  // Direct WhatsApp Order Trigger for individual product (decreases stock upon ordering)
  const handleBuyWhatsApp = (product) => {
    const currentStock = typeof product.stock === 'number' ? product.stock : 10;
    if (currentStock <= 0 || product.inStock === false) {
      alert('দুঃখিত, এই কম্বোটির স্টক শেষ হয়ে গেছে!');
      return;
    }

    // Deduct stock for direct order
    handleDeductStock([{ id: product.id, quantity: product.quantity || 1 }]);

    // Record WhatsApp real-time order & trigger instant notification
    const waOrder = {
      id: 'ORD-WA-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString('bn-BD'),
      timestamp: Date.now(),
      isRealTime: true,
      customer: {
        name: 'সম্মানিত ক্রেতা',
        address: 'হোয়াটসঅ্যাপ অর্ডার',
        district: 'insideDhaka',
        phone: 'WhatsApp Direct',
        paymentMethod: 'ক্যাশ অন ডেলিভারি (COD)'
      },
      items: [{
        id: product.id,
        name: product.name,
        banglaName: product.banglaName || product.name,
        selectedColor: product.selectedColor || product.color,
        price: product.price,
        quantity: product.quantity || 1,
        image: product.image
      }],
      grandTotal: product.price * (product.quantity || 1),
    };

    const existingOrders = JSON.parse(localStorage.getItem('giftvibes_store_orders') || '[]');
    localStorage.setItem('giftvibes_store_orders', JSON.stringify([waOrder, ...existingOrders]));
    window.dispatchEvent(new CustomEvent('giftvibes_new_order', { detail: waOrder }));

    const colorStr = product.selectedColor ? ` (কালার: ${product.selectedColor})` : '';
    const message = `হ্যালো ${STORE_CONFIG.storeName},\n\nআমি এই প্রিমিয়াম শাড়ি কম্বোটি অর্ডার করতে চাই:\n\n📦 *পণ্য:* ${product.banglaName || product.name}${colorStr}\n💰 *মূল্য:* ৳${product.price.toLocaleString()} BDT\n\nদয়া করে অর্ডার সম্পূর্ণ করার প্রক্রিয়াটি জানাবেন।`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encoded}`, '_blank');
  };

  // Admin Actions with LocalStorage Persistence
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleResetProducts = () => {
    if (window.confirm('আপনি কি সব প্রোডাক্ট ও স্টক রিসেট করতে চান?')) {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('giftvibes_store_products_v4', JSON.stringify(INITIAL_PRODUCTS));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Top Header Navbar */}
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Promotional Hero Banner */}
        <HeroBanner />

        {/* 4 Trust Feature Badges Row */}
        <TrustBar />

        {/* Category Pill Filters */}
        <CategoryBar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Featured Products Grid Section */}
        <section id="products-section" className="max-w-7xl mx-auto px-3 sm:px-8 py-8 sm:py-12 scroll-mt-20">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1.5 sm:mb-2">
                ✨ সম্পূর্ণ ৭-ইন-১ লাক্সারি গিফট কালেকশন
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeCategory === 'All' ? 'সকল কালার ভ্যারিয়েশন (১১টি অপশন)' : `${activeCategory} শাড়ি কম্বো`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                পছন্দের কালারটি নির্বাচন করে ঘরে বসেই অর্ডার করুন। পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার পূর্ণ সুবিধা!
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <p className="text-sm font-bold text-slate-500">
                দুঃখিত, কোনো প্রোডাক্ট পাওয়া যায়নি।
              </p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onQuickView={(p) => setSelectedProductModal(p)}
                    onAddToCart={handleAddToCart}
                    onBuyWhatsApp={handleBuyWhatsApp}
                  />
                ))}
              </div>

              {/* Dynamic Pagination Controls: More (+4) and Less (-4) */}
              {(visibleCount < filteredProducts.length || visibleCount > 8) && (
                <div className="text-center pt-6 flex flex-wrap items-center justify-center gap-3.5">
                  {/* More Button: shown when more products remain */}
                  {visibleCount < filteredProducts.length && (
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 4)}
                      className="px-8 py-3.5 bg-slate-900 hover:bg-black text-amber-300 hover:text-amber-200 font-bold text-xs rounded-2xl shadow-md border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>আরও প্রোডাক্ট দেখুন (+{Math.min(4, filteredProducts.length - visibleCount)}টি)</span>
                      <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
                    </button>
                  )}

                  {/* Less Button: shown only when more than 8 products are currently displayed */}
                  {visibleCount > 8 && (
                    <button
                      onClick={() => {
                        setVisibleCount((prev) => Math.max(8, prev - 4));
                        const section = document.getElementById('products-section');
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-2xl shadow-md border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                      <span>কম প্রোডাক্ট দেখুন (Show Less)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </section>

        {/* Customer Reviews & 5-Star Testimonials Section */}
        <CustomerReviews />

      </main>

      {/* Footer Section */}
      <Footer />

      {/* Live Order Social Proof Notification Popup (FOMO) */}
      <LiveSalesNotification />

      {/* Floating WhatsApp Quick Chat Button */}
      <FloatingWhatsappButton />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
        onBuyWhatsApp={handleBuyWhatsApp}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onCompleteOrder={(order) => {
          handleDeductStock(order.items);
          setCartItems([]);
          localStorage.removeItem('giftvibes_store_cart_v1');
        }}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        onUpdateStock={handleUpdateStock}
      />

    </div>
  );
}
