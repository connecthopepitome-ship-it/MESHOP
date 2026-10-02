'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, CreditCard, Truck, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { repository } from '@/lib/api/googleSheetsRepository';
import { defaultPaymentProvider } from '@/lib/adapters/paymentAdapter';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
import { trackEvent } from '@/lib/analytics';

export default function CheckoutPage() {
  const { cart, subtotal, discount, shipping, total, clearCart, appliedCoupon } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'online_razorpay' as 'online_razorpay' | 'cod',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl text-brand-charcoal">Your Cart is Empty</h1>
        <p className="text-xs text-brand-muted">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block bg-brand-charcoal text-brand-base px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim() || !formData.addressLine1.trim() || !formData.pincode.trim()) {
      setErrorMsg('Please complete all required shipping fields marked with *');
      return;
    }

    // 6-digit Indian PIN code format check
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsSubmitting(true);
    trackEvent('begin_checkout', { itemCount: cart.length, total });

    try {
      // 1. Process payment via adapter
      const paymentRes = await defaultPaymentProvider.processPayment(
        `TEMP-${Date.now()}`,
        total,
        'INR',
        formData.paymentMethod
      );

      if (!paymentRes.success) {
        setErrorMsg(paymentRes.error || 'Payment authorization failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 2. Submit order payload to Google Sheets repository
      const orderPayload = {
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        shippingAddress: {
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        items: cart.map((c) => ({
          productId: c.product.productId,
          sku: c.product.sku || c.product.productId,
          name: c.product.name,
          price: c.product.price,
          selectedBlouseSize: c.selectedBlouseSize,
          quantity: c.quantity,
          mainImage: c.product.mainImage,
        })),
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: (formData.paymentMethod === 'cod' ? 'PENDING' : 'PAID') as any,
        fulfillmentStatus: 'NEW' as any,
        notes: formData.notes,
      };

      const result = await repository.createOrder(orderPayload);

      if (result.success) {
        trackEvent('purchase', { orderId: result.orderId, total });
        clearCart();
        window.location.href = `/order-confirmation/${result.orderId}`;
      } else {
        setErrorMsg(result.error || 'Order creation failed. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-4">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 mr-1" /> 256-Bit SSL Encrypted Checkout
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-charcoal font-medium">Boutique Checkout</h1>
      </div>

      {errorMsg && (
        <div className="bg-brand-burgundy/10 border border-brand-burgundy text-brand-burgundy p-4 text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Shipping & Payment Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Contact & Shipping Address */}
          <div className="bg-brand-surface p-6 border border-brand-border space-y-4">
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-3">
              1. Delivery Shipping Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Mobile Number (WhatsApp updates) *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Email Address (Receipt & Tracking) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Street Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House/Flat No., Building Name, Street"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Landmark, Area"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New Delhi"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Delhi"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="110054"
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  readOnly
                  className="w-full bg-brand-border/40 border border-brand-border px-3 py-2 text-xs cursor-not-allowed text-brand-muted"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-brand-surface p-6 border border-brand-border space-y-4">
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-3">
              2. Payment Method
            </h3>

            <div className="space-y-3 text-xs">
              <label className={`flex items-start space-x-3 p-4 border cursor-pointer transition-colors ${
                formData.paymentMethod === 'online_razorpay' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border bg-brand-base'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online_razorpay"
                  checked={formData.paymentMethod === 'online_razorpay'}
                  onChange={handleChange}
                  className="mt-0.5 text-brand-gold"
                />
                <div>
                  <span className="font-semibold text-brand-charcoal block">Online Payment (Razorpay / UPI / Cards / Netbanking)</span>
                  <span className="text-brand-muted block mt-0.5">Instant confirmation with 256-bit secure gateway encryption.</span>
                </div>
              </label>

              <label className={`flex items-start space-x-3 p-4 border cursor-pointer transition-colors ${
                formData.paymentMethod === 'cod' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border bg-brand-base'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="mt-0.5 text-brand-gold"
                />
                <div>
                  <span className="font-semibold text-brand-charcoal block">Cash on Delivery (COD)</span>
                  <span className="text-brand-muted block mt-0.5">Pay in cash upon doorstep delivery verification.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Complete Order Button (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-surface p-6 border border-brand-border space-y-4 sticky top-24">
            <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-3">
              Order Items ({cart.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  <div className="relative w-12 aspect-[3/4] bg-brand-border/20 flex-shrink-0">
                    <Image src={item.product.mainImage} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-brand-muted">
                      Qty: {item.quantity} {item.selectedBlouseSize && `• Size ${item.selectedBlouseSize}`}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-brand-muted border-t border-brand-border pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-charcoal">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-burgundy font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-brand-charcoal pt-3 border-t border-brand-border font-serif">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-4 px-4 font-semibold uppercase tracking-widest text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Authorizing Order...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Place Order • {formatPrice(total)}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-brand-muted text-center italic">
              By placing your order, you agree to our Terms of Service and Return Policies.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
