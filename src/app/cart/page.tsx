'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success?: boolean; text?: string } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ success: res.success, text: res.message });
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-brand-border mx-auto" />
        <h1 className="font-serif text-3xl text-brand-charcoal">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-brand-muted max-w-sm mx-auto">
          Explore our handloom heritage sarees and add your favorite creations.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-brand-charcoal text-brand-base px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
        >
          Explore Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Review Selection</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Your Shopping Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-brand-border text-xs uppercase tracking-wider font-semibold text-brand-muted">
            <span className="col-span-6">Saree</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-4 text-right">Subtotal</span>
          </div>

          {cart.map((item, idx) => (
            <div
              key={`${item.product.productId}-${item.selectedBlouseSize}-${idx}`}
              className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 bg-brand-surface border border-brand-border/60"
            >
              <div className="sm:col-span-6 flex items-center space-x-4">
                <div className="relative w-20 aspect-[3/4] bg-brand-border/20 flex-shrink-0">
                  <Image src={item.product.mainImage} alt={item.product.name} fill className="object-cover" />
                </div>
                <div>
                  <Link href={`/product/${item.product.slug}`} className="font-serif text-sm font-medium hover:text-brand-gold">
                    {item.product.name}
                  </Link>
                  {item.selectedBlouseSize && (
                    <span className="text-xs text-brand-muted block mt-0.5">
                      Blouse Size: <strong>{item.selectedBlouseSize}</strong>
                    </span>
                  )}
                  <span className="text-xs font-semibold text-brand-charcoal block mt-1">
                    {formatPrice(item.product.price)}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
                <div className="flex items-center border border-brand-border bg-brand-base">
                  <button
                    onClick={() => updateQuantity(item.product.productId, item.quantity - 1, item.selectedBlouseSize)}
                    className="px-2.5 py-1 text-xs hover:bg-brand-border"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.productId, item.quantity + 1, item.selectedBlouseSize)}
                    className="px-2.5 py-1 text-xs hover:bg-brand-border"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="sm:col-span-4 flex items-center justify-between sm:justify-end space-x-4">
                <span className="font-sans text-sm font-semibold text-brand-charcoal">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeFromCart(item.product.productId, item.selectedBlouseSize)}
                  className="text-brand-muted hover:text-brand-burgundy p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-brand-surface p-6 border border-brand-border space-y-4">
            <h3 className="font-serif text-lg font-semibold uppercase tracking-wider text-brand-charcoal border-b border-brand-border pb-3">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            {!appliedCoupon ? (
              <form onSubmit={handleApply} className="flex">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs uppercase"
                />
                <button type="submit" className="bg-brand-charcoal text-brand-base px-4 text-xs uppercase font-semibold hover:bg-brand-gold hover:text-brand-charcoal">
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center bg-brand-gold/15 p-2 px-3 border border-brand-gold/40 text-xs">
                <span>Code <strong>{appliedCoupon.code}</strong> Applied</span>
                <button onClick={removeCoupon} className="text-brand-burgundy font-semibold hover:underline">Remove</button>
              </div>
            )}
            {couponMsg && (
              <p className={`text-[11px] ${couponMsg.success ? 'text-green-700' : 'text-brand-burgundy'}`}>
                {couponMsg.text}
              </p>
            )}

            <div className="space-y-2 text-xs text-brand-muted border-t border-brand-border pt-4">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-brand-charcoal">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-burgundy">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Express Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-brand-charcoal pt-3 border-t border-brand-border font-serif">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-4 px-4 flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-widest shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-[11px] text-brand-muted flex items-center justify-center space-x-1 pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Guaranteed SSL Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
