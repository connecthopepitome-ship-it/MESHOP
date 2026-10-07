'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Truck,
  Ruler,
  MessageCircle,
  Star,
  Maximize2,
  X,
  Check,
  Share2,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
import { ProductImage } from '@/components/shared/ProductImage';
import { ProductCard } from '@/components/catalog/ProductCard';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';
import { trackEvent } from '@/lib/analytics';

export default function ProductDetailClient({ 
  initialProduct, 
  allProducts, 
  slug 
}: { 
  initialProduct: Product; 
  allProducts: Product[]; 
  slug: string; 
}) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBlouseSize, setSelectedBlouseSize] = useState<string>(
    (initialProduct.blouseSizesAvailable?.length ?? 0) > 0 ? initialProduct.blouseSizesAvailable![0] : 'M'
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [fullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Related & recently viewed
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Pincode state
  const [pincode, setPincode] = useState('');
  const [shippingQuote, setShippingQuote] = useState<{ cost: number; estimatedDays: string; servicable: boolean } | null>(null);

  // Tabs / Accordion state
  const [activeTab, setActiveTab] = useState<'description' | 'care' | 'shipping' | 'reviews'>('description');

  const mainCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent('view_item', { productId: initialProduct.productId, name: initialProduct.name, price: initialProduct.price });

    const related = allProducts.filter(
      (p) => p.productId !== initialProduct.productId && (p.category === initialProduct.category || p.fabric === initialProduct.fabric)
    );
    setRelatedProducts(related.slice(0, 4));

    if (typeof window !== 'undefined') {
      try {
        const existing: string[] = JSON.parse(localStorage.getItem('meshop_recently_viewed') || '[]');
        const updated = Array.from(new Set([initialProduct.productId, ...existing])).slice(0, 10);
        localStorage.setItem('meshop_recently_viewed', JSON.stringify(updated));

        const found = allProducts.filter((p) => existing.includes(p.productId) && p.productId !== initialProduct.productId);
        setRecentlyViewed(found.slice(0, 4));
      } catch (e) {
        console.warn('Failed to parse recently viewed storage:', e);
      }
    }
  }, [initialProduct, allProducts]);

  // Observer for sticky purchase bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!mainCtaRef.current) return;
      const rect = mainCtaRef.current.getBoundingClientRect();
      if (rect.bottom < 0) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const inWishlist = isInWishlist(product.productId);
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);

  // Construct guaranteed 5-image repertoire
  const baseGallery =
    Array.isArray(product.galleryImages) && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.mainImage];

  const defaultSareeAngles = [
    product.mainImage,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1610030469668-98634127027d?auto=format&fit=crop&w=1200&q=85',
  ];

  const gallery = [...baseGallery];
  while (gallery.length < 5) {
    const nextAngle = defaultSareeAngles[gallery.length % defaultSareeAngles.length];
    if (!gallery.includes(nextAngle)) {
      gallery.push(nextAngle);
    } else {
      gallery.push(defaultSareeAngles[(gallery.length + 1) % defaultSareeAngles.length]);
    }
  }

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

  const attributes = [
    { label: 'FABRIC', value: product.fabric || product.displayFabric },
    { label: 'SAREE TYPE', value: product.sareeType },
    { label: 'OCCASION', value: Array.isArray(product.occasion) ? product.occasion.join(', ') : product.occasion },
    { label: 'PATTERN', value: product.pattern },
    { label: 'WORK', value: Array.isArray(product.work) ? product.work.join(', ') : product.work },
    { label: 'BORDER', value: product.border },
    { label: 'COLOUR', value: product.colour },
    { label: 'BLOUSE TYPE', value: product.blouseType },
    { label: 'BLOUSE FABRIC', value: product.blouseFabric },
    { label: 'LOOM TYPE', value: product.loomType }
  ].filter(attr => attr.value && String(attr.value).trim() !== '');

  const stockStatus =
    product.stockQty > 5
      ? { text: `In stock`, color: 'bg-emerald-500' }
      : product.stockQty > 0
      ? { text: `Low stock — ${product.stockQty} remaining`, color: 'bg-amber-500' }
      : { text: 'OUT OF STOCK', color: 'bg-rose-500' };

  return (
    <div className="w-full bg-warm-ivory text-deep-espresso min-h-screen pb-32 font-sans-body">
      <div className="max-w-[1440px] w-full mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-8">
        {/* Editorial Breadcrumb Navigation */}
        <nav className="font-sans-fashion text-[0.65rem] sm:text-[0.7rem] text-deep-espresso/60 uppercase tracking-widest flex flex-wrap items-center gap-2 mb-4 sm:mb-8">
          <Link href="/" className="hover:text-terracotta transition-colors">HOME</Link>
          <span className="text-champagne">/</span>
          <Link href="/shop" className="hover:text-terracotta transition-colors">SAREES</Link>
          <span className="text-champagne">/</span>
          <span className="text-deep-espresso font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* MOBILE PRODUCT TITLE HEADER */}
        <div className="lg:hidden mb-5 space-y-2">
          <h1 className="font-serif-display text-3xl text-deep-espresso font-normal leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center justify-between text-[0.68rem] font-sans-fashion text-deep-espresso/60 tracking-wider uppercase pt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 border border-champagne/40">
                <Star className="w-3 h-3 fill-champagne text-champagne" />
                <span className="font-bold text-deep-espresso">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
              </div>
              <span>({product.reviewCount || 126} reviews)</span>
            </div>
            <span>SKU: {product.sku || product.productId}</span>
          </div>
        </div>

        {/* Split Editorial Layout Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT: GALLERY STAGE (Approx 60%) */}
          <div className="lg:col-span-7 relative z-10 lg:sticky lg:top-28">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              
              {/* Desktop Vertical Thumbnail Rail */}
              <div className="hidden sm:flex flex-col items-center gap-3 w-[72px] flex-shrink-0">
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto no-scrollbar py-1 w-full">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[3/4] w-full rounded-[14px] overflow-hidden transition-all duration-300 ${
                        activeImageIndex === idx
                          ? 'ring-2 ring-deep-espresso scale-[1.02] shadow-sm opacity-100'
                          : 'opacity-60 hover:opacity-100 hover:scale-[1.03]'
                      }`}
                    >
                      <ProductImage src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Product Image */}
              <div className="flex-1 relative aspect-[3/4] w-full rounded-[16px] overflow-hidden bg-soft-sand group z-1">
                <ProductImage
                  src={gallery[activeImageIndex] || product.mainImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.015]"
                />

                {/* Floating Image Counter (Top-Left) */}
                <div className="absolute top-4 left-4 z-10 bg-white/30 px-3 py-1.5 rounded-full text-deep-espresso font-sans-fashion text-[0.65rem] font-bold tracking-widest uppercase border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md">
                  {String(activeImageIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                </div>

                {/* Circular Glass Action Buttons (Top-Right) */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-3">
                  <button
                    onClick={() => setFullscreenModalOpen(true)}
                    className="w-11 h-11 rounded-full bg-white/30 text-deep-espresso hover:text-terracotta hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center border border-white/40 backdrop-blur-md"
                    aria-label="Expand Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`w-11 h-11 rounded-full transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center border backdrop-blur-md hover:-translate-y-0.5 ${
                      inWishlist
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-white/30 text-deep-espresso hover:text-terracotta border-white/40'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-[18px] h-[18px] ${inWishlist ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Small Discount Badge inside image if requested */}
                {discount && (
                  <div className="absolute bottom-4 left-4 z-10 bg-terracotta/90 text-white font-sans-fashion text-[0.65rem] px-3 py-1.5 rounded-full font-bold tracking-wider uppercase shadow-md backdrop-blur-md border border-white/20">
                    SAVE {discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Horizontal Thumbnail Slider */}
            <div className="flex sm:hidden space-x-2 overflow-x-auto mt-4 py-1 no-scrollbar snap-x snap-mandatory">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`snap-start relative w-[60px] aspect-[3/4] rounded-xl overflow-hidden transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'ring-1 ring-deep-espresso scale-[1.02] opacity-100 shadow-sm'
                      : 'opacity-60 border border-champagne/40'
                  }`}
                >
                  <ProductImage src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: STRUCTURED PRODUCT INFORMATION AREA (Approx 40%) */}
          <div className="lg:col-span-5 space-y-8 lg:pb-0">
            
            {/* Desktop Title & Meta */}
            <div className="hidden lg:block space-y-3">
              {/* Category / Fabric Eyebrow */}
              <div className="font-sans-fashion text-[0.65rem] font-bold text-terracotta tracking-widest uppercase flex items-center gap-1.5">
                <span className="text-[10px]">✦</span>
                <span>{product.fabric || 'PREMIUM SAREE'}</span>
                {product.occasion && (
                  <>
                    <span className="text-deep-espresso/30">·</span>
                    <span>{Array.isArray(product.occasion) ? product.occasion[0] : product.occasion}</span>
                  </>
                )}
              </div>

              <h1 className="font-serif-display text-4xl lg:text-[2.75rem] text-deep-espresso font-normal leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-center justify-between text-[0.65rem] font-sans-fashion text-deep-espresso/50 tracking-wider uppercase pt-2">
                <span>SKU: {product.sku || product.productId}</span>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Product link copied to clipboard!');
                    }
                  }}
                  className="hover:text-terracotta transition-colors flex items-center gap-1.5 font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE EDIT</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-sans-body text-deep-espresso/70 pt-1">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-champagne/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <Star className="w-3 h-3 fill-champagne text-champagne" />
                  <span className="font-bold text-deep-espresso">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                </div>
                <span>({product.reviewCount || 126} verified customer reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-1 pt-1 border-t border-champagne/30 lg:border-t-0 lg:pt-0">
              <div className="flex items-baseline gap-4">
                <span className="font-serif-display text-[2rem] font-medium text-deep-espresso">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="font-sans-body text-base text-deep-espresso/40 line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                )}
              </div>
              <span className="font-sans-body text-[0.7rem] text-deep-espresso/50">Inclusive of all taxes</span>
            </div>

            {/* Short Description */}
            <div className="font-sans-body text-[0.95rem] text-deep-espresso/80 leading-[1.6]">
              {product.shortDescription || product.description || 'Experience the elegance of this premium handcrafted saree. Designed for special occasions with meticulous detailing.'}
            </div>

            {/* NEW: STRUCTURED ATTRIBUTE CARDS (SAREE DETAILS) */}
            {attributes.length > 0 && (
              <div className="pt-2">
                <div className="font-sans-fashion text-[0.65rem] font-bold text-deep-espresso tracking-widest uppercase mb-4 flex items-center gap-2">
                  <span className="text-terracotta">◈</span> SAREE DETAILS
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {attributes.map((attr, idx) => (
                    <div 
                      key={idx} 
                      className={`bg-white/40 backdrop-blur-md rounded-[16px] p-4 border border-white shadow-[0_4px_16px_rgba(44,33,30,0.03)] ${
                        String(attr.value).length > 25 ? 'col-span-2' : 'col-span-1'
                      }`}
                    >
                      <span className="block font-sans-fashion text-[0.55rem] font-bold text-deep-espresso/50 tracking-widest uppercase mb-1">
                        {attr.label}
                      </span>
                      <span className="block font-sans-body text-[0.9rem] font-medium text-deep-espresso">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <label className="font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest text-deep-espresso flex items-center gap-2">
                  <span className="text-terracotta">◈</span> BLOUSE SIZE REFERENCE
                </label>
                <button
                  onClick={() => setSizeModalOpen(true)}
                  className="font-sans-fashion text-[0.65rem] text-terracotta font-bold flex items-center gap-1.5 hover:underline"
                >
                  <Ruler className="w-3 h-3" />
                  <span>SIZE GUIDE →</span>
                </button>
              </div>

              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                {['S', 'M', 'L', 'XL', 'XXL', 'UNSTITCHED'].map((sz) => {
                  const isSelected = selectedBlouseSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedBlouseSize(sz)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-full font-sans-fashion text-[0.7rem] font-bold transition-all border ${
                        isSelected
                          ? 'bg-deep-espresso text-warm-ivory border-deep-espresso'
                          : 'bg-white/60 hover:bg-soft-sand text-deep-espresso border-champagne/40 hover:border-terracotta'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest text-deep-espresso">
                  QUANTITY
                </span>
                <div className="flex items-center bg-white/60 rounded-full px-2 py-1.5 border border-champagne/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center font-bold text-lg text-deep-espresso/60 hover:text-terracotta disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="px-4 font-sans-fashion text-[0.8rem] font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    disabled={quantity >= product.stockQty}
                    className="w-8 h-8 flex items-center justify-center font-bold text-lg text-deep-espresso/60 hover:text-terracotta disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-champagne/30 w-fit">
                <span className={`w-2 h-2 rounded-full ${stockStatus.color}`} />
                <span className="font-sans-body text-[0.7rem] font-medium text-deep-espresso">
                  {stockStatus.text}
                </span>
              </div>
            </div>

            {/* Desktop Purchase CTAs (Hidden on mobile where sticky bar is used) */}
            <div ref={mainCtaRef} className="hidden lg:grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQty <= 0}
                className="w-full rounded-[18px] bg-deep-espresso text-warm-ivory h-[56px] font-sans-fashion text-[0.75rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-[1px] hover:shadow-lg transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stockQty <= 0}
                className="w-full rounded-[18px] bg-terracotta text-white h-[56px] font-sans-fashion text-[0.75rem] font-bold uppercase tracking-widest flex items-center justify-center hover:-translate-y-[1px] hover:shadow-lg transition-all disabled:opacity-50"
              >
                BUY NOW
              </button>
            </div>

            {/* Delivery & Pincode Glass Module */}
            <div className="bg-white/40 backdrop-blur-md rounded-[18px] p-5 border border-white shadow-[0_4px_20px_rgba(44,33,30,0.04)] mt-6">
              <span className="font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest block text-deep-espresso flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-terracotta" />
                DELIVERY & PINCODE ESTIMATOR
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2 relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="flex-1 bg-white border border-champagne/50 rounded-[14px] px-5 py-3.5 text-[0.85rem] font-sans-body text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/30 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-[10px] bg-deep-espresso text-warm-ivory px-6 font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest hover:bg-terracotta transition-colors"
                >
                  CHECK
                </button>
              </form>

              {shippingQuote && (
                <div className="pt-4 text-[0.8rem] font-sans-body">
                  {shippingQuote.servicable ? (
                    <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Estimated delivery: <strong>3–7 days</strong> (Complimentary insured shipping)
                    </p>
                  ) : (
                    <p className="text-rose-700 font-medium">✕ Please verify your 6-digit postal pincode.</p>
                  )}
                </div>
              )}
            </div>

            {/* Minimal Editorial Trust Strip */}
            <div className="grid grid-cols-2 gap-4 py-2 text-[0.65rem] font-sans-fashion font-bold tracking-widest text-deep-espresso/60 uppercase">
              <div className="flex items-center gap-2">
                <span className="text-terracotta text-[10px]">◈</span> FAST DISPATCH
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta text-[10px]">◈</span> SECURE CHECKOUT
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta text-[10px]">◈</span> EASY RETURNS
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta text-[10px]">◈</span> QUALITY CHECKED
              </div>
            </div>

            {/* WhatsApp Stylist Soft Glass Module */}
            <a
              href={`https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full h-[52px] rounded-[16px] bg-[#E8F3EC] hover:bg-[#DDF0E3] text-[#1E5631] font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-[#1E5631]/10 transition-all hover:-translate-y-[1px]"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              <span>ASK A PERSONAL STYLIST ON WHATSAPP</span>
            </a>

            {/* Tabbed Product Accordion */}
            <div className="pt-8">
              <div className="flex border-b border-champagne/40 mb-5 overflow-x-auto no-scrollbar gap-6">
                {(['description', 'care', 'shipping', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-sans-fashion text-[0.65rem] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-[2px] relative top-[1px] ${
                      activeTab === tab
                        ? 'border-terracotta text-deep-espresso'
                        : 'border-transparent text-deep-espresso/40 hover:text-deep-espresso'
                    }`}
                  >
                    {tab === 'description'
                      ? 'DESCRIPTION'
                      : tab === 'care'
                      ? 'FABRIC & CARE'
                      : tab === 'shipping'
                      ? 'SHIPPING'
                      : 'REVIEWS'}
                  </button>
                ))}
              </div>

              <div className="bg-white/30 backdrop-blur-sm rounded-[16px] p-6 border border-champagne/30 text-[0.85rem] font-sans-body text-deep-espresso/80 leading-relaxed font-light min-h-[160px]">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p>{product.description}</p>
                    <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-champagne/30">
                      <div className="font-sans-fashion text-[0.6rem] font-bold uppercase tracking-widest">SAREE LENGTH</div>
                      <div>{product.sareeLength || '5.5 meters'}</div>
                      <div className="font-sans-fashion text-[0.6rem] font-bold uppercase tracking-widest">BLOUSE PIECE</div>
                      <div>{product.blousePieceLength || '0.8 meters'} (Unstitched)</div>
                    </div>
                  </div>
                )}

                {activeTab === 'care' && (
                  <p>
                    {product.careInstructions ||
                      'Dry clean only to maintain silk luster and metallic zari integrity. Store wrapped in pure unbleached cotton muslin cloth away from direct heat.'}
                  </p>
                )}

                {activeTab === 'shipping' && (
                  <p>
                    Complimentary express door-step shipping across India. Orders are dispatched within 24–48 hours in tamper-evident luxury presentation packaging. Easy 7-day doorstep exchange supported.
                  </p>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="text-[2.5rem] font-serif-display font-medium text-deep-espresso leading-none">4.8</div>
                      <div>
                        <div className="flex text-champagne mb-1">★★★★★</div>
                        <span className="text-[0.7rem] text-deep-espresso/50 font-sans-fashion tracking-wider uppercase font-bold">Based on 126 reviews</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-6 text-right">5 ★</span>
                        <div className="flex-1 h-1.5 bg-soft-sand rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-terracotta" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-6 text-right">4 ★</span>
                        <div className="flex-1 h-1.5 bg-soft-sand rounded-full overflow-hidden">
                          <div className="w-[12%] h-full bg-champagne" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Signature SORAYVA Divider */}
        <div className="my-16 lg:my-24 flex items-center justify-center gap-6 text-champagne">
          <span className="w-16 h-[1px] bg-champagne/50" />
          <span className="text-xs font-serif-display text-terracotta">✦</span>
          <span className="w-16 h-[1px] bg-champagne/50" />
        </div>

        {/* Complete the Look Carousel */}
        {relatedProducts.length > 0 && (
          <section className="pt-4 pb-12">
            <div className="mb-10 text-center">
              <span className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-terracotta uppercase block mb-3">
                ATELIER STYLING
              </span>
              <h3 className="font-serif-display text-[2rem] text-deep-espresso font-normal">You May Also Like</h3>
            </div>
            {/* Desktop Grid / Mobile Horizontal Swipe */}
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 sm:gap-6 pb-6 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar">
              {relatedProducts.map((prod) => (
                <div key={prod.productId} className="w-[75vw] sm:w-[320px] lg:w-auto flex-shrink-0 snap-start">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* FLOATING STICKY GLASS PURCHASE BAR (Mobile & Tablet) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 py-3 px-4 pb-[max(env(safe-area-inset-bottom),12px)] border-t border-champagne/40 bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(44,33,30,0.08)]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stockQty <= 0}
            className="flex-1 rounded-[14px] bg-white text-deep-espresso border border-champagne/50 h-[52px] font-sans-fashion text-[0.7rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-soft-sand transition-colors disabled:opacity-50"
          >
            ADD TO BAG
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stockQty <= 0}
            className="flex-1 rounded-[14px] bg-deep-espresso text-warm-ivory h-[52px] font-sans-fashion text-[0.7rem] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-terracotta transition-colors shadow-md disabled:opacity-50"
          >
            BUY NOW
          </button>
        </div>
      </div>

      {/* Fullscreen Gallery View Modal */}
      {fullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-lg flex items-center justify-center p-4 lg:p-12 animate-fadeIn">
          <button
            onClick={() => setFullscreenModalOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-soft-sand text-deep-espresso hover:bg-champagne/40 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[3/4] lg:aspect-auto lg:h-[85vh] rounded-[24px] overflow-hidden shadow-2xl">
            <ProductImage
              src={gallery[activeImageIndex] || product.mainImage}
              alt={product.name}
              fill
              className="object-contain lg:object-cover"
            />
          </div>
        </div>
      )}

      <BlouseSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        onSelectSize={(sz) => setSelectedBlouseSize(sz)}
        currentSize={selectedBlouseSize}
      />
    </div>
  );
}
