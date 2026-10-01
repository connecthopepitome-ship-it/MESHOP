/**
 * Privacy-friendly Analytics Provider Abstract Layer
 * Tracks storefront events without collecting sensitive PII.
 */

export type AnalyticsEvent = 
  | 'view_item_list'
  | 'select_item'
  | 'search'
  | 'view_item'
  | 'add_to_wishlist'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'coupon_applied'
  | 'size_assistant_used'
  | 'whatsapp_clicked'
  | 'track_order_used';

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    // Log in development or pass to configured analytics provider (e.g., GA4, Plausible, PostHog)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event] ${event}`, payload || {});
    }
  }
}
