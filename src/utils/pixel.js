/**
 * Meta (Facebook) Pixel Tracking Utility
 * Pixel ID: 28043157995354761
 */

export const PIXEL_ID = '28043157995354761';

/**
 * Safe wrapper around window.fbq to prevent crashes if ad-blockers block Meta Pixel
 */
export function trackPixel(eventName, data = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', eventName, data);
    }
  } catch (err) {
    console.warn('[FB Pixel] Tracking failed:', err);
  }
}

/**
 * Track PageView
 */
export function trackPageView() {
  trackPixel('PageView');
}

/**
 * Track ViewContent when a product or modal is viewed
 */
export function trackViewContent(product) {
  if (!product) return;
  trackPixel('ViewContent', {
    content_name: product.name,
    content_category: product.category || 'Saree Combo',
    content_ids: [String(product._id || product.id || '')],
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: 'BDT',
  });
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return;
  trackPixel('AddToCart', {
    content_name: product.name,
    content_category: product.category || 'Saree Combo',
    content_ids: [String(product._id || product.id || '')],
    content_type: 'product',
    value: (Number(product.price) || 0) * (Number(quantity) || 1),
    currency: 'BDT',
  });
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(items = [], grandTotal = 0) {
  trackPixel('InitiateCheckout', {
    value: Number(grandTotal) || 0,
    currency: 'BDT',
    num_items: items.length,
    content_type: 'product',
    contents: items.map((item) => ({
      id: String(item._id || item.id || item.productId || ''),
      quantity: Number(item.quantity) || 1,
      item_price: Number(item.price) || 0,
    })),
  });
}

/**
 * Track Purchase event on order confirmation
 */
export function trackPurchase(orderData) {
  if (!orderData) return;
  const items = orderData.items || [];
  trackPixel('Purchase', {
    value: Number(orderData.grandTotal) || 0,
    currency: 'BDT',
    content_type: 'product',
    order_id: String(orderData.id || ''),
    num_items: items.length,
    contents: items.map((item) => ({
      id: String(item._id || item.id || item.productId || ''),
      quantity: Number(item.quantity) || 1,
      item_price: Number(item.price) || 0,
    })),
  });
}
