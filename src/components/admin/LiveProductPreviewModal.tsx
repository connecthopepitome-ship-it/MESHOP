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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-surface max-w-4xl w-full rounded-lg overflow-hidden shadow-2xl border border-outline-variant text-secondary relative animate-scaleUp">
        {/* Banner */}
        <div className="bg-amber-500 text-slate-950 px-6 py-2.5 flex items-center justify-between font-sans text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>LIVE STOREFRONT PREVIEW (SIMULATED CUSTOMER VIEW)</span>
          </div>
          <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded text-[10px]">
            STATUS: {product.status || 'Draft'}
          </span>
        </div>

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-surface-bright border-b border-outline-variant text-xs font-sans">
          <div className="flex items-center space-x-2 text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Security Guarantee: Customer view verified. Zero supplier/cost data exposed.</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-outline hover:text-secondary hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Product Preview Layout */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Left Gallery Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] relative bg-surface-bright fine-gold-border rounded-xs overflow-hidden">
              <ProductImage
                src={mainImage}
                alt={product.productName || product.name || 'Saree'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] relative bg-surface-bright fine-gold-border rounded-xs overflow-hidden">
                    <ProductImage src={img} alt={`Preview ${idx + 1}`} fill sizes="100px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details */}
          <div className="space-y-5">
            <div>
              <span className="font-sans-fashion text-xs font-semibold tracking-[0.2em] text-primary-container uppercase block">
                {product.category || 'SILK SAREES'}
              </span>
              <h2 className="font-serif-display text-2xl text-secondary font-normal tracking-tight mt-1">
                {product.productName || product.name}
              </h2>
              <p className="font-sans-body text-xs text-on-surface-variant font-light mt-1">
                {product.shortDescription || 'Handcrafted luxury saree from SORAYVA.'}
              </p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline space-x-3 bg-surface-bright p-4 fine-gold-border rounded-xs">
              <span className="font-serif text-2xl font-medium text-secondary">
                {formatPrice(price, product.currency || 'INR')}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <>
                  <span className="font-sans text-sm text-outline line-through font-light">
                    {formatPrice(compareAtPrice, product.currency || 'INR')}
                  </span>
                  {discount && (
                    <span className="bg-primary-container/15 text-secondary border border-primary-container/40 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Specifications */}
            <div className="space-y-2 text-xs font-sans-body text-on-surface-variant border-t border-b border-outline-variant/60 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div><strong className="text-secondary">Fabric:</strong> {product.fabric || 'Silk'}</div>
                <div><strong className="text-secondary">Colour:</strong> {product.colour || 'Crimson'}</div>
                <div><strong className="text-secondary">Occasion:</strong> {Array.isArray(product.occasion) ? product.occasion.join(', ') : product.occasion || 'Festive'}</div>
                <div><strong className="text-secondary">Work:</strong> {Array.isArray(product.work) ? product.work.join(', ') : product.work || 'Handloom'}</div>
              </div>
            </div>

            {/* Simulated Cart Actions */}
            <div className="space-y-3 pt-2">
              <button className="w-full bg-secondary text-white py-3 font-sans-fashion uppercase text-xs tracking-widest font-medium rounded-full flex items-center justify-center space-x-2 shadow-md">
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO SHOPPING BAG</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-outline font-sans-body pt-1">
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Complimentary Express Shipping</span>
                <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 7-Day Easy Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-bright px-6 py-4 border-t border-outline-variant flex items-center justify-between">
          <p className="text-[11px] text-outline font-sans">
            Note: This preview renders identical customer UI components.
          </p>
          <button
            onClick={onClose}
            className="bg-secondary text-white px-6 py-2 rounded-full text-xs font-sans uppercase font-medium hover:bg-primary transition-colors"
          >
            CLOSE PREVIEW
          </button>
        </div>
      </div>
    </div>
  );
};
