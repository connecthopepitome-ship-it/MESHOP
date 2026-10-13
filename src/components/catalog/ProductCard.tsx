'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ProductImage } from '@/components/shared/ProductImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  variant?: 'light' | 'dark';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, variant = 'light' }) => {
  const isDark = variant === 'dark';
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const inWishlist = isInWishlist(product.productId);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);

  const secondaryImage =
    product.galleryImages && product.galleryImages.length > 1
      ? product.galleryImages[1]
      : product.mainImage;

  const occasionLabel = Array.isArray(product.occasion)
    ? product.occasion[0]
    : product.occasion || 'Festive';

  const fabricLabel = product.fabric || 'Pure Silk';

  return (
    <div
      className={`group relative flex flex-col justify-between transition-all duration-500 rounded-xl overflow-hidden ${
        isDark
          ? 'bg-[#1c1412] border border-champagne/25 hover:border-champagne/60 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]'
          : 'bg-white border border-champagne/20 hover:border-champagne/60 hover:shadow-2xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Product Image Stage */}
        <div className={`relative aspect-[3/4] w-full overflow-hidden ${isDark ? 'bg-[#140e0d]' : 'bg-soft-sand/40'}`}>
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            {/* Primary & Secondary Crossfade Images */}
            <div className="relative w-full h-full">
              <ProductImage
                src={isHovered ? secondaryImage : product.mainImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.newArrival && (
              <span className={`px-2.5 py-0.5 rounded-full font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold ${
                isDark
                  ? 'bg-black/60 backdrop-blur-md text-champagne border border-champagne/40'
                  : 'sorayva-glass text-deep-espresso border border-champagne/40'
              }`}>
                NEW
              </span>
            )}
            {product.bestseller && (
              <span className="bg-terracotta text-white px-2.5 py-0.5 rounded-full font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold shadow-sm">
                BESTSELLER
              </span>
            )}
            {discount && (
              <span className={`px-2 py-0.5 rounded-full font-sans-fashion text-[0.65rem] tracking-widest font-semibold ${
                isDark
                  ? 'bg-terracotta text-white'
                  : 'bg-deep-espresso text-warm-ivory'
              }`}>
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Floating Glass Wishlist Icon */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-sm ${
              inWishlist
                ? 'bg-terracotta text-white border-terracotta scale-110'
                : isDark
                ? 'bg-black/50 backdrop-blur-md text-warm-ivory hover:text-terracotta border border-champagne/30 hover:scale-110'
                : 'sorayva-glass text-deep-espresso hover:text-terracotta hover:scale-110'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          {/* Floating Quick-Add Glass Bar (Hover Slide-Up) */}
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <div className={`rounded-full p-1.5 flex items-center justify-between gap-1 shadow-lg ${
              isDark
                ? 'bg-[#181110]/95 backdrop-blur-md border border-champagne/40'
                : 'sorayva-glass-bar border border-champagne/50'
            }`}>
              {onQuickView && (
                <button
                  onClick={() => onQuickView(product)}
                  className={`flex-1 py-2 px-3 rounded-full text-center font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'text-warm-ivory hover:text-champagne hover:bg-white/10'
                      : 'text-deep-espresso hover:bg-soft-sand'
                  }`}
                >
                  <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-champagne' : 'text-deep-espresso/70'}`} />
                  <span>QUICK VIEW</span>
                </button>
              )}
              <button
                onClick={() => addToCart(product, 1)}
                className={`flex-1 py-2 px-3 rounded-full text-center font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md ${
                  isDark
                    ? 'bg-champagne text-deep-espresso hover:bg-terracotta hover:text-white'
                    : 'bg-deep-espresso text-warm-ivory hover:bg-terracotta'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ BAG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Meta & Title Details */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between text-[0.7rem] font-sans-fashion tracking-widest uppercase font-semibold mb-1">
            <span className={isDark ? 'text-champagne font-bold' : 'text-terracotta font-semibold'}>
              {fabricLabel} · {occasionLabel}
            </span>
            {product.rating > 0 && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-white/10 text-warm-ivory border-champagne/30'
                  : 'bg-soft-sand/80 text-deep-espresso border-champagne/20'
              }`}>
                <Star className="w-3 h-3 fill-champagne text-champagne" />
                <span className="font-bold text-[0.65rem]">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className={`font-serif-display text-base sm:text-lg font-medium leading-snug line-clamp-2 transition-colors ${
              isDark
                ? 'text-warm-ivory group-hover/title:text-champagne'
                : 'text-deep-espresso group-hover/title:text-terracotta'
            }`}>
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing Strip */}
      <div className={`px-4 pb-4 pt-1 flex items-baseline justify-between border-t mt-2 ${
        isDark ? 'border-champagne/20' : 'border-champagne/10'
      }`}>
        <div className="flex items-baseline gap-2">
          <span className={`font-sans-fashion text-base sm:text-lg font-bold ${
            isDark ? 'text-champagne' : 'text-deep-espresso'
          }`}>
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={`font-sans-fashion text-xs line-through ${
              isDark ? 'text-warm-ivory/45' : 'text-deep-espresso/40'
            }`}>
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          className={`sm:hidden p-2 rounded-full transition-colors ${
            isDark
              ? 'bg-champagne text-deep-espresso hover:bg-terracotta hover:text-white'
              : 'bg-deep-espresso text-warm-ivory hover:bg-terracotta'
          }`}
          title="Add to Bag"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
