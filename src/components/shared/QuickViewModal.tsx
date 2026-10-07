'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductImage } from '@/components/shared/ProductImage';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenSizeGuide?: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onOpenSizeGuide,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!product) return null;

  const inWishlist = isInWishlist(product.productId);
  const images = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.mainImage];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-warm-ivory border border-champagne/40 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 md:p-8 rounded-[20px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-deep-espresso hover:text-terracotta transition-colors bg-soft-sand rounded-full hover:bg-champagne/40"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full bg-soft-sand rounded-[16px] overflow-hidden">
              <ProductImage
                src={images[activeImageIndex] || product.mainImage}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
            </div>
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 aspect-[3/4] rounded-lg overflow-hidden transition-all flex-shrink-0 snap-start ${
                      activeImageIndex === idx ? 'ring-2 ring-deep-espresso scale-[1.02] shadow-sm' : 'opacity-60 hover:opacity-100 border border-champagne/40'
                    }`}
                  >
                    <ProductImage src={img} alt={`Thumbnail ${idx}`} fill className="object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & CTA */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="font-sans-fashion text-[0.65rem] tracking-widest text-terracotta uppercase font-bold block mb-1">
                {product.fabric} <span className="text-deep-espresso/30 mx-1">•</span> {product.category}
              </span>
              <h2 className="font-serif-display text-3xl sm:text-[2rem] font-normal text-deep-espresso mt-1 leading-[1.1]">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline space-x-4 border-b border-champagne/30 pb-4">
                <span className="font-serif-display text-2xl font-semibold text-deep-espresso">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="font-sans-body text-sm text-deep-espresso/50 line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                )}
              </div>

              <p className="font-sans-body text-sm text-deep-espresso/80 mt-4 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Blouse Size Selector */}
              {product.blouseSizesAvailable && product.blouseSizesAvailable.length > 0 && (
                <div className="mt-6 pt-4 border-t border-champagne/30">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest text-deep-espresso">
                      Select Blouse Size
                    </label>
                    {onOpenSizeGuide && (
                      <button
                        onClick={onOpenSizeGuide}
                        className="font-sans-fashion text-[0.65rem] text-terracotta uppercase tracking-widest hover:underline font-bold"
                      >
                        SIZE GUIDE →
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.blouseSizesAvailable.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 text-[0.7rem] font-sans-fashion font-bold uppercase transition-all rounded-full border ${
                          selectedSize === sz
                            ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-md'
                            : 'bg-white/60 hover:bg-soft-sand text-deep-espresso border-champagne/40 hover:border-terracotta'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-6 flex items-center space-x-4">
                <label className="font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest text-deep-espresso">
                  QUANTITY
                </label>
                <div className="flex items-center bg-white/60 rounded-full px-2 py-1.5 border border-champagne/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center font-bold text-lg text-deep-espresso/60 hover:text-terracotta disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 font-sans-fashion text-[0.75rem] font-bold text-center w-10">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    disabled={quantity >= product.stockQty}
                    className="w-7 h-7 flex items-center justify-center font-bold text-lg text-deep-espresso/60 hover:text-terracotta disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQty <= 0}
                className="w-full rounded-[14px] bg-deep-espresso text-warm-ivory h-[52px] font-sans-fashion text-[0.7rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-terracotta transition-all shadow-md disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="w-1/2 rounded-[14px] bg-white border border-champagne/50 h-[48px] text-[0.7rem] font-sans-fashion font-bold uppercase tracking-widest text-deep-espresso hover:border-terracotta flex items-center justify-center space-x-2 transition-colors"
                >
                  <Heart className={`w-[18px] h-[18px] ${inWishlist ? 'fill-terracotta text-terracotta' : ''}`} />
                  <span>{inWishlist ? 'SAVED' : 'WISHLIST'}</span>
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-1/2 rounded-[14px] bg-white border border-champagne/50 h-[48px] text-[0.7rem] font-sans-fashion font-bold uppercase tracking-widest text-deep-espresso hover:border-terracotta flex items-center justify-center space-x-2 transition-colors"
                >
                  FULL DETAILS →
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center space-x-6 text-[0.65rem] font-sans-fashion font-bold uppercase tracking-widest text-deep-espresso/60">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-terracotta" /> Authentic Guarantee</span>
                <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1.5 text-terracotta" /> Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
