'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/catalog/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Saved Treasures</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Your Wishlist</h1>
        <p className="text-xs text-brand-muted">
          {wishlist.length === 1 ? '1 saree saved for later' : `${wishlist.length} sarees saved for later`}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface border border-brand-border p-8 space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-brand-border mx-auto" />
          <h3 className="font-serif text-xl text-brand-charcoal">Your wishlist is currently empty.</h3>
          <p className="text-xs text-brand-muted">
            Tap the heart icon on any Kanjeevaram or Banarasi creation to save it to your personal boutique curation.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-brand-charcoal text-brand-base px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((prod) => (
            <ProductCard key={prod.productId} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
