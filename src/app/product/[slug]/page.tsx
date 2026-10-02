'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, ShoppingBag, Truck, ShieldCheck, Ruler, MessageCircle, Star, ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
import { ProductImage } from '@/components/shared/ProductImage';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';
import { trackEvent } from '@/lib/analytics';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBlouseSize, setSelectedBlouseSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [shippingQuote, setShippingQuote] = useState<{ cost: number; estimatedDays: string; servicable: boolean } | null>(null);

  // Accordion toggle states
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await repository.getProductBySlug(params.slug);
        setProduct(prod);
        if (prod && (prod.blouseSizesAvailable?.length ?? 0) > 0) {
          setSelectedBlouseSize(prod.blouseSizesAvailable![0]);
        }
        if (prod) {
          trackEvent('view_item', { productId: prod.productId, name: prod.name, price: prod.price });

          // Store product in recently viewed localStorage array
          if (typeof window !== 'undefined') {
            try {
              const existing: string[] = JSON.parse(localStorage.getItem('meshop_recently_viewed') || '[]');
              const updated = Array.from(new Set([prod.productId, ...existing])).slice(0, 10);
              localStorage.setItem('meshop_recently_viewed', JSON.stringify(updated));
            } catch (e) {
              console.warn('Failed to update recently viewed products in storage:', e);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load product detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-[1560px] mx-auto px-4 md:px-8 py-16 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[3/4] bg-surface-bright fine-gold-border rounded-xs" />
          <div className="space-y-4">
            <div className="h-6 bg-surface-container w-1/3" />
            <div className="h-10 bg-surface-container w-3/4" />
            <div className="h-8 bg-surface-container w-1/4" />
            <div className="h-32 bg-surface-container w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const inWishlist = isInWishlist(product.productId);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const gallery = product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.mainImage];

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    const quote = await defaultShippingProvider.calculateShipping(pincode, product.price);
    setShippingQuote(quote);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedBlouseSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedBlouseSize);
    window.location.href = '/checkout';
  };

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: gallery,
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: product.currency,
      price: product.price,
      availability: product.stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const occasionLabel = Array.isArray(product.occasion) ? product.occasion.join(', ') : product.occasion || 'Festive';

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-12 space-y-12 bg-surface text-secondary">
      {/* Inject Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <nav className="font-sans-fashion text-xs text-outline uppercase tracking-wider flex items-center space-x-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-secondary font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Product Images Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-surface-container fine-gold-border overflow-hidden rounded-xs">
            <ProductImage
              src={gallery[activeImageIndex] || product.mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />

            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-surface-bright/90 backdrop-blur-md text-secondary hover:text-primary transition-colors shadow-sm"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-secondary text-secondary' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 aspect-[3/4] border transition-all flex-shrink-0 rounded-xs ${
                    activeImageIndex === idx
                      ? 'border-primary-container ring-1 ring-primary-container opacity-100'
                      : 'border-outline-variant/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <ProductImage src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 text-secondary">
          <div>
            <span className="font-sans-fashion text-xs font-semibold tracking-[0.25em] text-primary-container uppercase block mb-1">
              {product.fabric} • {occasionLabel}
            </span>
            <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl text-secondary font-normal leading-tight">
              {product.name}
            </h1>
            <p className="font-sans-fashion text-xs text-outline tracking-widest uppercase mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price & Badges */}
          <div className="flex items-baseline space-x-4 pt-3 border-t border-outline-variant/50">
            <span className="font-sans-fashion text-3xl font-bold text-secondary">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans-fashion text-lg text-outline line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
            {discount && (
              <span className="bg-secondary text-white font-sans-fashion text-xs font-bold px-3 py-1 uppercase tracking-wider">
                SAVE {discount}%
              </span>
            )}
          </div>

          <p className="font-sans-body text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Blouse Size Selector */}
          <div className="space-y-2.5 pt-4 border-t border-outline-variant/50">
            <div className="flex justify-between items-center">
              <label className="font-sans-fashion text-xs font-semibold uppercase tracking-wider text-secondary">
                Unstitched Blouse Piece Reference:
              </label>
              <button
                onClick={() => setSizeModalOpen(true)}
                className="font-sans-fashion text-xs text-primary-container hover:underline font-medium flex items-center space-x-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>BLOUSE SIZE GUIDE</span>
              </button>
            </div>

            <p className="font-sans-body text-xs text-outline font-light italic">
              Includes matching 0.8m–0.9m unstitched fabric piece. Select custom size reference below:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {((product.blouseSizesAvailable?.length ?? 0) > 0 ? product.blouseSizesAvailable! : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedBlouseSize(sz)}
                  className={`w-11 h-11 font-sans-fashion text-xs font-semibold uppercase border transition-all rounded-xs ${
                    selectedBlouseSize === sz
                      ? 'border-primary-container bg-primary-container/15 text-secondary font-bold ring-1 ring-primary-container'
                      : 'border-outline-variant/60 bg-surface-bright text-outline hover:border-secondary'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & CTAs */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/50">
            <div className="flex items-center space-x-4">
              <span className="font-sans-fashion text-xs font-semibold uppercase tracking-wider text-secondary">Quantity:</span>
              <div className="flex items-center border border-outline-variant bg-surface-bright rounded-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 font-sans-fashion text-sm font-semibold hover:bg-surface-container transition-colors"
                >
                  -
                </button>
                <span className="px-4 font-sans-fashion text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                  className="px-3 py-1.5 font-sans-fashion text-sm font-semibold hover:bg-surface-container transition-colors"
                >
                  +
                </button>
              </div>
              <span className="font-sans-fashion text-xs text-primary-container font-semibold uppercase">
                {product.stockQty > 0 ? `IN STOCK (${product.stockQty} LEFT)` : 'OUT OF STOCK'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-primary-container text-white hover:bg-primary py-4 px-6 font-sans-fashion text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center space-x-2 transition-colors rounded-full shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-secondary text-white hover:bg-black py-4 px-6 font-sans-fashion text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center transition-colors rounded-full shadow-md"
              >
                BUY NOW
              </button>
            </div>
          </div>

          {/* Pincode Delivery Checker */}
          <div className="p-4 bg-surface-bright fine-gold-border space-y-3 text-xs rounded-xs">
            <span className="font-sans-fashion font-semibold uppercase tracking-wider block text-secondary flex items-center">
              <Truck className="w-4 h-4 mr-2 text-primary-container" /> CHECK DOORSTEP DELIVERY & PIN CODE
            </span>
            <form onSubmit={handlePincodeCheck} className="flex">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 110054)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="w-full bg-surface border border-outline-variant px-3 py-2 text-xs font-sans-body text-secondary focus:outline-none focus:border-primary-container"
              />
              <button
                type="submit"
                className="bg-secondary text-white px-5 text-xs font-sans-fashion uppercase tracking-wider hover:bg-primary transition-colors whitespace-nowrap"
              >
                Check
              </button>
            </form>

            {shippingQuote && (
              <div className="pt-2 text-xs font-sans-body">
                {shippingQuote.servicable ? (
                  <p className="text-green-800 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-700" /> Servicable! Estimated Delivery: <strong>{shippingQuote.estimatedDays}</strong> ({shippingQuote.cost === 0 ? 'Complimentary Express Delivery' : `Shipping ₹${shippingQuote.cost}`})
                  </p>
                ) : (
                  <p className="text-secondary font-medium">
                    ✕ Invalid PIN code format. Please verify your 6-digit postal pincode.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* WhatsApp Stylist Support Action */}
          <div className="p-4 border border-outline-variant/60 bg-surface-container flex items-center justify-between rounded-xs">
            <div className="text-xs">
              <span className="font-sans-fashion font-semibold text-secondary uppercase tracking-wider block">Need Stylist Assistance?</span>
              <span className="font-sans-body text-on-surface-variant font-light">Ask our saree drapers about fabric feel and drape details.</span>
            </div>
            <a
              href={`https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-green-700 text-white px-4 py-2.5 text-xs font-sans-fashion font-semibold uppercase tracking-wider hover:bg-green-800 transition-colors flex items-center space-x-1.5 rounded-full whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Stylist</span>
            </a>
          </div>

          {/* Accordion Tabs */}
          <div className="border-t border-outline-variant/60 pt-4 text-xs space-y-3 font-sans-body">
            <div className="border border-outline-variant/60 rounded-xs">
              <button
                onClick={() => setActiveTab(activeTab === 'details' ? ('' as any) : 'details')}
                className="w-full p-3 font-sans-fashion font-semibold uppercase tracking-wider text-left bg-surface-bright flex justify-between items-center text-secondary"
              >
                <span>Product Specifications & Details</span>
                {activeTab === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeTab === 'details' && (
                <div className="p-4 space-y-2 text-on-surface-variant bg-surface font-light leading-relaxed border-t border-outline-variant/40">
                  <p><strong>Fabric:</strong> {product.fabric}</p>
                  <p><strong>Saree Length:</strong> {product.sareeLength || '5.5 meters'}</p>
                  <p><strong>Blouse Piece:</strong> {product.blousePieceLength || '0.8 meters'} ({product.blouseIncluded ? 'Unstitched Included' : 'Not included'})</p>
                  <p><strong>Occasion:</strong> {occasionLabel}</p>
                  {product.workType && <p><strong>Work / Craft:</strong> {product.workType}</p>}
                  {product.pattern && <p><strong>Pattern:</strong> {product.pattern}</p>}
                  {product.colour && <p><strong>Colour:</strong> {product.colour}</p>}
                </div>
              )}
            </div>

            <div className="border border-outline-variant/60 rounded-xs">
              <button
                onClick={() => setActiveTab(activeTab === 'care' ? ('' as any) : 'care')}
                className="w-full p-3 font-sans-fashion font-semibold uppercase tracking-wider text-left bg-surface-bright flex justify-between items-center text-secondary"
              >
                <span>Preservation & Care Instructions</span>
                {activeTab === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeTab === 'care' && (
                <div className="p-4 text-on-surface-variant bg-surface font-light leading-relaxed border-t border-outline-variant/40">
                  {product.careInstructions || 'Dry clean only. Store wrapped in pure unbleached muslin cloth away from direct heat and sunlight.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-bright border-t border-outline-variant p-3 shadow-lg flex items-center justify-between">
        <div>
          <span className="font-sans-fashion text-[10px] text-outline uppercase block">Total Price</span>
          <span className="font-sans-fashion text-base font-bold text-secondary">{formatPrice(product.price)}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-primary-container text-white px-6 py-3 text-xs font-sans-fashion uppercase tracking-widest font-semibold rounded-full"
        >
          ADD TO BAG
        </button>
      </div>

      <BlouseSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        onSelectSize={(sz) => setSelectedBlouseSize(sz)}
        currentSize={selectedBlouseSize}
      />
    </div>
  );
}

