'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

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
      <div className="bg-brand-base border border-brand-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full bg-brand-surface border border-brand-border overflow-hidden">
              <Image
                src={images[activeImageIndex] || product.mainImage}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
            </div>
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 aspect-[3/4] border transition-all ${
                      activeImageIndex === idx ? 'border-brand-gold ring-1 ring-brand-gold' : 'border-brand-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & CTA */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs tracking-widest text-brand-gold uppercase font-semibold block">
                {product.fabric} • {product.category}
              </span>
              <h2 className="font-serif text-2xl font-semibold text-brand-charcoal mt-1 leading-snug">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline space-x-3">
                <span className="font-sans text-xl font-bold text-brand-charcoal">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="font-sans text-sm text-brand-muted line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                )}
              </div>

              <p className="text-xs text-brand-muted mt-4 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Blouse Size Selector */}
              {product.blouseSizesAvailable && product.blouseSizesAvailable.length > 0 && (
                <div className="mt-6 pt-4 border-t border-brand-border">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                      Select Blouse Size:
                    </label>
                    {onOpenSizeGuide && (
                      <button
                        onClick={onOpenSizeGuide}
                        className="text-[11px] text-brand-gold uppercase tracking-wider underline font-medium"
                      >
                        Size Assistant
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.blouseSizesAvailable.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-10 h-10 text-xs font-semibold uppercase border transition-colors ${
                          selectedSize === sz
                            ? 'border-brand-gold bg-brand-gold/15 text-brand-charcoal font-bold'
                            : 'border-brand-border bg-brand-surface text-brand-muted hover:border-brand-charcoal'
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
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                  Quantity:
                </label>
                <div className="flex items-center border border-brand-border bg-brand-surface">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm font-semibold hover:bg-brand-border transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    className="px-3 py-1 text-sm font-semibold hover:bg-brand-border transition-colors"
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
                className="w-full bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-3.5 px-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="w-1/2 border border-brand-border py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-brand-charcoal hover:border-brand-gold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-brand-burgundy text-brand-burgundy' : ''}`} />
                  <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
                </button>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-1/2 bg-brand-charcoal text-brand-base hover:bg-brand-gold hover:text-brand-charcoal py-2.5 px-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-colors"
                >
                  Full Details →
                </Link>
              </div>

              <div className="pt-3 flex items-center justify-center space-x-4 text-[11px] text-brand-muted">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-gold" /> Authentic Guarantee</span>
                <span className="flex items-center"><Check className="w-3.5 h-3.5 mr-1 text-brand-gold" /> Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
