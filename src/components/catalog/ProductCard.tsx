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

  const occasionLabel = Array.isArray(product.occasion)
    ? product.occasion[0]
    : product.occasion || 'Festive';

  const fabricLabel = product.fabric || 'Pure Silk';

  return (
    <div
      className="group relative flex flex-col justify-between transition-all duration-500 rounded-xl overflow-hidden bg-white/40 border border-champagne/20 hover:border-champagne/60 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Product Image Stage */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-soft-sand/40">
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
              <span className="sorayva-glass px-2.5 py-0.5 rounded-full text-deep-espresso font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold border border-champagne/40">
                NEW
              </span>
            )}
            {product.bestseller && (
              <span className="bg-terracotta text-white px-2.5 py-0.5 rounded-full font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold shadow-sm">
                BESTSELLER
              </span>
            )}
            {discount && (
              <span className="bg-deep-espresso text-warm-ivory px-2 py-0.5 rounded-full font-sans-fashion text-[0.65rem] tracking-widest font-semibold">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Floating Glass Wishlist Icon */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full sorayva-glass flex items-center justify-center transition-all duration-300 z-10 shadow-sm ${
              inWishlist
                ? 'bg-terracotta text-white border-terracotta scale-110'
                : 'text-deep-espresso hover:text-terracotta hover:scale-110'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          {/* Floating Quick-Add Glass Bar (Hover Slide-Up) */}
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <div className="sorayva-glass-bar rounded-full p-1.5 flex items-center justify-between gap-1 shadow-lg border border-champagne/50">
              {onQuickView && (
                <button
                  onClick={() => onQuickView(product)}
                  className="flex-1 py-2 px-3 rounded-full text-center font-sans-fashion text-[0.65rem] tracking-widest uppercase text-deep-espresso font-bold hover:bg-soft-sand transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-deep-espresso/70" />
                  <span>QUICK VIEW</span>
                </button>
              )}
              <button
                onClick={() => addToCart(product, 1)}
                className="flex-1 py-2 px-3 rounded-full bg-deep-espresso text-warm-ivory text-center font-sans-fashion text-[0.65rem] tracking-widest uppercase font-bold hover:bg-terracotta transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ BAG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Meta & Title Details */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between text-[0.7rem] font-sans-fashion text-terracotta tracking-widest uppercase font-semibold mb-1">
            <span>
              {fabricLabel} · {occasionLabel}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-soft-sand/80 text-deep-espresso border border-champagne/20">
                <Star className="w-3 h-3 fill-champagne text-champagne" />
                <span className="font-bold text-[0.65rem]">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block group/title">
            <h3 className="font-serif-display text-base sm:text-lg text-deep-espresso font-medium leading-snug line-clamp-2 group-hover/title:text-terracotta transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pricing Strip */}
      <div className="px-4 pb-4 pt-1 flex items-baseline justify-between border-t border-champagne/10 mt-2">
        <div className="flex items-baseline gap-2">
          <span className="font-sans-fashion text-base sm:text-lg text-deep-espresso font-bold">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-sans-fashion text-xs text-deep-espresso/40 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          className="sm:hidden p-2 rounded-full bg-deep-espresso text-warm-ivory hover:bg-terracotta transition-colors"
          title="Add to Bag"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
