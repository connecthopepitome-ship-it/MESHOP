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

  return (
    <div
      className="bg-surface-bright fine-gold-border p-3 sm:p-4 group flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-4 rounded-xs">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <ProductImage
              src={isHovered ? secondaryImage : product.mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
            {product.newArrival && (
              <span className="bg-surface-bright/95 backdrop-blur-xs text-secondary font-sans-fashion text-[0.65rem] px-2.5 py-0.5 tracking-widest uppercase border border-outline-variant/60 font-medium">
                NEW
              </span>
            )}
            {product.bestseller && (
              <span className="bg-primary-container text-white font-sans-fashion text-[0.65rem] px-2.5 py-0.5 tracking-widest uppercase font-medium">
                BESTSELLER
              </span>
            )}
            {discount && (
              <span className="bg-secondary text-white font-sans-fashion text-[0.65rem] px-2 py-0.5 tracking-widest font-semibold">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-bright/90 hover:bg-white flex items-center justify-center text-secondary transition-colors z-10 shadow-xs"
            title="Save to Wishlist"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-secondary text-secondary' : 'text-secondary'}`} />
          </button>

          {/* Hover Quick Actions */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-surface-bright/95 backdrop-blur-sm border-t border-outline-variant/60 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center flex items-center justify-center gap-2">
            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                className="font-sans-fashion text-[0.65rem] tracking-[0.16em] uppercase text-secondary font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>QUICK VIEW</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Header & Title */}
        <div className="px-1">
          <div className="flex items-center justify-between text-xs font-sans-fashion text-primary-container tracking-wider uppercase mb-1.5">
            <span className="font-medium text-[0.6875rem]">
              {product.fabric} • {occasionLabel}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-secondary">
                <Star className="w-3 h-3 fill-primary-container text-primary-container" />
                <span className="font-medium text-xs">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif-display text-base sm:text-lg text-secondary font-normal mb-1.5 min-h-[3rem] group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Card Footer: Price & Add to Bag */}
      <div className="pt-3 border-t border-outline-variant/50 px-1 mt-2">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-sans-fashion text-base text-secondary font-semibold">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans-fashion text-xs text-outline line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>
          {discount && (
            <span className="font-sans-fashion text-[0.65rem] text-primary-container font-semibold uppercase">
              Save {discount}%
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          className="w-full h-10 rounded-full fine-gold-border bg-transparent text-secondary hover:bg-secondary hover:text-white font-sans-fashion text-xs tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>ADD TO BAG</span>
        </button>
      </div>
    </div>
  );
};

