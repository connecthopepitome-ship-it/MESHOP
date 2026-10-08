'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="font-serif-display text-3xl text-deep-espresso mb-6">My Wishlist</h1>

      <div className="sorayva-glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center border border-champagne/40">
        <Heart className="w-12 h-12 text-deep-espresso/30 mb-4" />
        <h2 className="font-serif-editorial text-2xl text-deep-espresso mb-2">YOUR WISHLIST IS EMPTY</h2>
        <p className="font-sans-body text-sm text-deep-espresso/70 mb-6">
          Save items you love to review them later.
        </p>
        <Link 
          href="/shop"
          className="px-8 py-3 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors"
        >
          EXPLORE SAREES
        </Link>
      </div>
    </div>
  );
}
