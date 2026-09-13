import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';

// Helper to convert numbers to Bengali digits
function toBengaliNumber(num) {
  if (num === undefined || num === null) return '';
  return num.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
}

// Calculate relative time in Bengali
function formatTimeAgoBengali(timestamp) {
  if (!timestamp) return 'এইমাত্র';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSec < 45) {
    return 'এইমাত্র';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${toBengaliNumber(diffMin)} মিনিট আগে`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${toBengaliNumber(diffDays)} দিন আগে`;
}

// Format customer location from real order address/district
function formatCustomerLocation(customer) {
  if (!customer) return 'বাংলাদেশ';
  
  if (customer.address) {
    const parts = customer.address
      .split(/[,–\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    if (parts.length === 1) {
      return parts[0];
    }
  }

  return customer.district === 'insideDhaka' ? 'ঢাকা' : 'ঢাকার বাইরে';
}

// Format product name and color from order items
function formatOrderItem(order) {
  if (!order || !order.items || order.items.length === 0) {
    return 'Premium Saree Combo';
  }

  const first = order.items[0];
  const name = first.banglaName || first.name || 'Premium Saree Combo';
  const color = first.selectedColor ? ` (${first.selectedColor})` : '';
  const extra = order.items.length > 1 ? ` (+${toBengaliNumber(order.items.length - 1)}টি)` : '';

  return `${name}${color}${extra}`;
}

export default function LiveSalesNotification() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isJustOrdered, setIsJustOrdered] = useState(false);
  const hideTimeoutRef = useRef(null);

  // Show a notification for a given order
  const displayNotification = (order, isRealTime = false) => {
    if (!order) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setCurrentOrder(order);
    setIsJustOrdered(isRealTime || Boolean(order.isRealTime) || (order.timestamp && Date.now() - order.timestamp < 60000));
    setIsVisible(true);

    // Stay visible for 6.5 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6500);
  };

  useEffect(() => {
    // 1. Real-time custom event listener (immediate trigger when someone orders on this site)
    const handleNewOrder = (event) => {
      const order = event.detail;
      if (order) {
        displayNotification(order, true);
      }
    };

    // 2. Storage event listener (sync real-time across tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'giftvibes_store_orders' && e.newValue) {
        try {
          const orders = JSON.parse(e.newValue);
          if (orders && orders.length > 0) {
            displayNotification(orders[0], true);
          }
        } catch (err) {
          // ignore parsing error
        }
      }
    };

    window.addEventListener('giftvibes_new_order', handleNewOrder);
    window.addEventListener('storage', handleStorageChange);

    // 3. Periodic rotation ONLY IF real orders already exist in storage
    const interval = setInterval(() => {
      const savedOrders = JSON.parse(localStorage.getItem('giftvibes_store_orders') || '[]');
      if (savedOrders.length > 0) {
        // Pick a random recent order from real history
        const randomIndex = Math.floor(Math.random() * Math.min(savedOrders.length, 8));
        const selected = savedOrders[randomIndex];
        displayNotification(selected, false);
      }
    }, 28000); // Gentle cycle every 28 seconds

    return () => {
      window.removeEventListener('giftvibes_new_order', handleNewOrder);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!isVisible || !currentOrder) return null;

  const customerName = currentOrder.customer?.name?.trim() || 'সম্মানিত ক্রেতা';
  const customerLocation = formatCustomerLocation(currentOrder.customer);
  const itemName = formatOrderItem(currentOrder);
  const timeAgoText = formatTimeAgoBengali(currentOrder.timestamp);
  const firstItemImage = currentOrder.items?.[0]?.image;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.92 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 bg-white/95 backdrop-blur-md border border-amber-500/25 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl shadow-slate-900/15 flex items-center gap-2.5 sm:gap-3 max-w-[calc(100vw-5rem)] sm:max-w-sm font-sans"
      >
        {/* Left Icon or Product Thumbnail */}
        <div className="relative shrink-0">
          {firstItemImage ? (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400/40 shadow-xs">
              <img src={firstItemImage} alt="Ordered item" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-orange-600 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
          )}
          
          {/* Live pulsing indicator dot */}
          {isJustOrdered && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500" />
            </span>
          )}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 pr-0.5 sm:pr-1">
          <p className="text-[11.5px] sm:text-xs font-bold text-slate-900 truncate">
            {customerName}{' '}
            <span className="text-slate-500 font-medium text-[10px] sm:text-[11px]">({customerLocation})</span>
          </p>
          
          <p className="text-[10px] sm:text-[11px] text-amber-700 font-bold truncate leading-tight mt-0.5">
            {itemName}
          </p>
          
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            {isJustOrdered ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300/80 px-1.5 sm:px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                এইমাত্র অর্ডার করেছেন (রিয়েল-টাইম)
              </span>
            ) : (
              <span className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <span>🔥 অর্ডার করেছেন ({timeAgoText})</span>
              </span>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
          title="বন্ধ করুন"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
