'use client';

import React from 'react';
import { InternalProduct, PublicProduct } from '@/types';
import { ProductImage } from '@/components/shared/ProductImage';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { X, Eye, ShieldCheck, CheckCircle2, ShoppingBag, Heart, AlertCircle } from 'lucide-react';

interface LiveProductPreviewModalProps {
  product: InternalProduct | PublicProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveProductPreviewModal: React.FC<LiveProductPreviewModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const price = product.price || 0;
  const compareAtPrice = product.compareAtPrice;
  const discount = calculateDiscountPercentage(price, compareAtPrice);
  const images = product.images || product.galleryImages || [product.mainImage];
  const mainImage = images[0] || product.mainImage;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-deep-espresso/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-brand-border text-deep-espresso relative animate-scaleUp">
        {/* Banner */}
        <div className="bg-terracotta text-white px-6 py-3 flex items-center justify-between font-sans text-xs font-bold uppercase tracking-widest shadow-sm">
          <div className="flex items-center space-x-2.5">
            <Eye className="w-4 h-4" />
            <span>Live Storefront Preview (Simulated Customer View)</span>
          </div>
          <span className="bg-white/20 text-white border border-white/40 px-3 py-1 rounded-md text-[10px] font-mono shadow-sm">
            STATUS: {product.status || 'Draft'}
          </span>
        </div>

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-surface border-b border-brand-border text-xs font-sans">
          <div className="flex items-center space-x-2.5 text-brand-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Security Guarantee: Customer view verified. Zero supplier/cost data exposed.</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-deep-espresso hover:bg-white transition-colors border border-transparent hover:border-brand-border shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Product Preview Layout */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Left Gallery Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] relative bg-warm-ivory border border-brand-border/60 rounded-xl overflow-hidden shadow-sm">
              <ProductImage
                src={mainImage}
                alt={product.productName || product.name || 'Saree'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] relative bg-warm-ivory border border-brand-border/60 rounded-lg overflow-hidden shadow-sm hover:opacity-80 transition-opacity cursor-pointer">
                    <ProductImage src={img} alt={`Preview ${idx + 1}`} fill sizes="100px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-sans text-xs font-semibold tracking-widest text-brand-muted uppercase block">
                {product.category || 'SILK SAREES'}
              </span>
              <h2 className="font-serif-editorial text-3xl text-deep-espresso font-medium tracking-tight leading-tight">
                {product.productName || product.name}
              </h2>
              <p className="font-sans text-sm text-brand-muted font-light leading-relaxed">
                {product.shortDescription || 'Handcrafted luxury saree from SORAYVA.'}
              </p>
            </div>

            {/* Price Box */}
            <div className="flex items-center space-x-4 bg-brand-surface p-5 border border-brand-border/80 rounded-xl shadow-inner">
              <span className="font-serif-editorial text-3xl font-medium text-deep-espresso">
                {formatPrice(price, product.currency || 'INR')}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <div className="flex flex-col">
                  <span className="font-sans text-sm text-brand-muted line-through font-medium">
                    {formatPrice(compareAtPrice, product.currency || 'INR')}
                  </span>
                  {discount && (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-md uppercase tracking-widest mt-0.5">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="space-y-3 text-sm font-sans text-brand-muted border-t border-b border-brand-border/60 py-5">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div><strong className="text-deep-espresso font-medium">Fabric:</strong> {product.fabric || 'Silk'}</div>
                <div><strong className="text-deep-espresso font-medium">Colour:</strong> {product.colour || 'Crimson'}</div>
                <div><strong className="text-deep-espresso font-medium">Occasion:</strong> {Array.isArray(product.occasion) ? product.occasion.join(', ') : product.occasion || 'Festive'}</div>
                <div><strong className="text-deep-espresso font-medium">Work:</strong> {Array.isArray(product.work) ? product.work.join(', ') : product.work || 'Handloom'}</div>
              </div>
            </div>

            {/* Simulated Cart Actions */}
            <div className="space-y-4 pt-2">
              <button className="w-full bg-deep-espresso text-champagne hover:bg-terracotta hover:text-white py-4 font-sans uppercase text-xs tracking-widest font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-md transition-colors">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <div className="flex items-center justify-between text-xs text-brand-muted font-sans pt-1">
                <span className="flex items-center font-medium"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Complimentary Express Shipping</span>
                <span className="flex items-center font-medium"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> 7-Day Easy Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 border-t border-brand-border flex items-center justify-between shadow-subtle">
          <p className="text-xs text-brand-muted font-sans font-medium">
            Note: This preview renders identical customer UI components.
          </p>
          <button
            onClick={onClose}
            className="bg-deep-espresso text-champagne hover:bg-terracotta hover:text-white px-6 py-2.5 rounded-lg text-xs font-sans uppercase font-semibold transition-colors shadow-sm tracking-widest"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
