'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const inWishlist = isInWishlist(product.productId);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);

  const secondaryImage =
    product.galleryImages && product.galleryImages.length > 1
      ? product.galleryImages[1]
      : product.mainImage;

  return (
    <div
      className="group relative flex flex-col bg-brand-base border border-brand-border/60 hover:border-brand-gold/50 transition-all duration-300 shadow-subtle hover:shadow-card overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.newArrival && (
          <span className="bg-brand-charcoal text-brand-base text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 shadow-sm">
            New
          </span>
        )}
        {product.bestseller && (
          <span className="bg-brand-gold text-brand-charcoal text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 shadow-sm">
            Bestseller
          </span>
        )}
        {discount && (
          <span className="bg-brand-burgundy text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">
            -{discount}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-brand-base/80 backdrop-blur-md text-brand-charcoal hover:text-brand-burgundy transition-colors shadow-sm focus:outline-none"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-brand-burgundy text-brand-burgundy' : ''}`} />
      </button>

      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-brand-surface block">
        <Image
          src={isHovered ? secondaryImage : product.mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Quick Action Overlay Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="bg-brand-base text-brand-charcoal hover:bg-brand-gold text-xs font-semibold uppercase tracking-wider py-2 px-3 flex items-center space-x-1.5 transition-colors shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
            className="bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal text-xs font-semibold uppercase tracking-wider py-2 px-3 flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-grow justify-between text-left">
        <div>
          <span className="text-[10px] tracking-widest text-brand-muted uppercase block font-sans">
            {product.fabric} • {product.category}
          </span>
          <Link href={`/product/${product.slug}`} className="group-hover:text-brand-gold transition-colors">
            <h3 className="font-serif text-sm font-medium text-brand-charcoal line-clamp-2 mt-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-sm font-semibold text-brand-charcoal">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans text-xs text-brand-muted line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center text-xs text-brand-gold font-sans font-medium">
            <span>★ {product.rating}</span>
            <span className="text-brand-muted text-[10px] ml-1">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
