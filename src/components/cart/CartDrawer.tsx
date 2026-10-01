'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
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

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success?: boolean; text?: string } | null>(null);

  if (!isCartOpen) return null;

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const freeShippingThreshold = 10000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity animate-fadeIn">
      <div className="w-full max-w-md bg-brand-base h-full flex flex-col justify-between shadow-drawer animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
            <h2 className="font-serif text-lg tracking-wider text-brand-charcoal uppercase font-semibold">
              Shopping Bag ({cart.reduce((acc, item) => acc + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none"
            aria-label="Close Bag"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-brand-surface px-5 py-3 border-b border-brand-border/60 text-xs">
          {freeShippingRemaining > 0 ? (
            <p className="text-brand-muted font-sans">
              Add <span className="font-semibold text-brand-charcoal">{formatPrice(freeShippingRemaining)}</span> more for <span className="text-brand-gold font-semibold">Free Express Shipping</span>
            </p>
          ) : (
            <p className="text-brand-gold font-semibold flex items-center space-x-1">
              <Check className="w-4 h-4 inline" /> <span>Complimentary Worldwide Express Shipping Unlocked!</span>
            </p>
          )}
          <div className="w-full bg-brand-border h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-gold h-full transition-all duration-300"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-brand-muted">
              <ShoppingBag className="w-12 h-12 mx-auto text-brand-border mb-3" />
              <p className="font-serif text-lg text-brand-charcoal">Your shopping bag is currently empty.</p>
              <p className="text-xs mt-1">Discover our latest Kanjeevaram and Banarasi handloom arrivals.</p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="mt-6 inline-block bg-brand-charcoal text-brand-base px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
              >
                Explore Catalogue
              </Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.product.productId}-${item.selectedBlouseSize || 'std'}-${index}`}
                className="flex space-x-4 p-3 bg-brand-surface border border-brand-border/60 rounded-none relative"
              >
                <div className="relative w-20 aspect-[3/4] bg-brand-border/20 flex-shrink-0">
                  <Image
                    src={item.product.mainImage}
                    alt={item.product.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="font-serif text-xs font-medium text-brand-charcoal hover:text-brand-gold line-clamp-1 pr-2"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.product.productId, item.selectedBlouseSize)}
                        className="text-brand-muted hover:text-brand-burgundy transition-colors p-1"
                        aria-label="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedBlouseSize && (
                      <span className="text-[10px] text-brand-muted block uppercase tracking-wider mt-0.5">
                        Blouse Size: <strong className="text-brand-charcoal">{item.selectedBlouseSize}</strong>
                      </span>
                    )}
                    <span className="text-[10px] text-brand-muted block uppercase tracking-wider">
                      Fabric: {item.product.fabric}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
                    <div className="flex items-center border border-brand-border bg-brand-base">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.productId, item.quantity - 1, item.selectedBlouseSize)
                        }
                        className="px-2 py-0.5 text-xs text-brand-charcoal hover:bg-brand-border transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.productId, item.quantity + 1, item.selectedBlouseSize)
                        }
                        className="px-2 py-0.5 text-xs text-brand-charcoal hover:bg-brand-border transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-sans text-xs font-semibold text-brand-charcoal">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-brand-surface space-y-4">
            {/* Promo Coupon Form */}
            {!appliedCoupon ? (
              <form onSubmit={handleCouponSubmit} className="flex">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-gold uppercase"
                />
                <button
                  type="submit"
                  className="bg-brand-charcoal text-brand-base px-4 text-xs font-semibold uppercase tracking-wider hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center bg-brand-gold/15 p-2 px-3 border border-brand-gold/30 text-xs">
                <span className="text-brand-charcoal font-medium">
                  Coupon <strong>{appliedCoupon.code}</strong> Applied
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-brand-burgundy font-semibold hover:underline text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}

            {couponMessage && (
              <p className={`text-[11px] ${couponMessage.success ? 'text-green-700' : 'text-brand-burgundy'}`}>
                {couponMessage.text}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-brand-muted border-t border-brand-border/60 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-charcoal">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-burgundy font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-brand-charcoal pt-2 border-t border-brand-border font-serif">
                <span>Estimated Total</span>
                <span className="text-brand-charcoal">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-3 px-4 flex items-center justify-center space-x-2 text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
