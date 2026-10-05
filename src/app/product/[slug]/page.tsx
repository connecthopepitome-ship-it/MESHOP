'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Ruler,
  MessageCircle,
  Star,
  ChevronDown,
  Check,
  Maximize2,
  X,
  Sparkles,
  RotateCcw,
  Award,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
import { ProductImage } from '@/components/shared/ProductImage';
import { ProductCard } from '@/components/catalog/ProductCard';
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

          const all = await repository.getProducts({});
          const related = all.filter(
            (p) => p.productId !== prod.productId && (p.category === prod.category || p.fabric === prod.fabric)
          );
          setRelatedProducts(related.slice(0, 4));

          if (typeof window !== 'undefined') {
            try {
              const existing: string[] = JSON.parse(localStorage.getItem('meshop_recently_viewed') || '[]');
              const updated = Array.from(new Set([prod.productId, ...existing])).slice(0, 10);
              localStorage.setItem('meshop_recently_viewed', JSON.stringify(updated));

              const found = all.filter((p) => existing.includes(p.productId) && p.productId !== prod.productId);
              setRecentlyViewed(found.slice(0, 4));
            } catch (e) {
              console.warn('Failed to parse recently viewed storage:', e);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[3/4] sorayva-glass-card rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 bg-soft-sand w-1/3 rounded" />
            <div className="h-10 bg-soft-sand w-3/4 rounded" />
            <div className="h-8 bg-soft-sand w-1/4 rounded" />
            <div className="h-32 bg-soft-sand w-full rounded" />
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

  const occasionLabel = Array.isArray(product.occasion) ? product.occasion.join(', ') : product.occasion || 'Festive';
  const fabricLabel = product.fabric || 'Pure Silk';
  const workLabel = product.workType || 'Handloom Weave';
  const styleLabel = product.pattern || 'Contemporary Editorial';

  const stockStatus =
    product.stockQty > 5
      ? { text: `In stock — ${product.stockQty} pieces remaining`, color: 'bg-emerald-500' }
      : product.stockQty > 0
      ? { text: `Only ${product.stockQty} left in stock`, color: 'bg-amber-500' }
      : { text: 'Currently unavailable', color: 'bg-rose-500' };

  return (
    <div className="w-full bg-warm-ivory text-deep-espresso min-h-screen pb-24 font-sans-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
        {/* Editorial Breadcrumb Navigation */}
        <nav className="font-sans-fashion text-[0.7rem] text-deep-espresso/60 uppercase tracking-widest flex items-center space-x-2 mb-8">
          <Link href="/" className="hover:text-terracotta transition-colors">
            Home
          </Link>
          <span className="text-champagne">/</span>
          <Link href="/shop" className="hover:text-terracotta transition-colors">
            Shop
          </Link>
          <span className="text-champagne">/</span>
          <span className="text-terracotta font-bold">{product.category}</span>
          <span className="text-champagne">/</span>
          <span className="text-deep-espresso font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Split Editorial Layout Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT: GALLERY STAGE (6.5 Cols) */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* Reduced Compact Desktop Vertical 5-Thumbnail Strip (Width 64px) */}
              <div className="hidden sm:flex flex-col items-center gap-2.5 w-16 sm:w-18 flex-shrink-0">
                <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto no-scrollbar py-0.5 w-full">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        activeImageIndex === idx
                          ? 'border-deep-espresso ring-2 ring-champagne/60 scale-104 shadow-md opacity-100 filter saturate-100'
                          : 'border-champagne/30 opacity-70 filter saturate-[0.85] hover:opacity-100 hover:scale-104 hover:border-terracotta'
                      }`}
                    >
                      <ProductImage src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
                {gallery.length > 5 && (
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % gallery.length)}
                    className="p-1.5 rounded-full sorayva-glass text-deep-espresso hover:text-terracotta border border-champagne/40 shadow-xs"
                    aria-label="Next angle"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Main Product Image Viewport */}
              <div className="flex-1 relative aspect-[3/4] w-full rounded-[18px] overflow-hidden sorayva-glass-card shadow-[0_15px_40px_rgba(44,33,30,0.08)] border border-champagne/40 group">
                <ProductImage
                  src={gallery[activeImageIndex] || product.mainImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.015]"
                />

                {/* Floating Image Counter Pill */}
                <div className="absolute top-4 left-4 z-10 sorayva-glass px-3 py-1 rounded-full text-deep-espresso font-sans-fashion text-[0.65rem] font-bold tracking-widest uppercase border border-champagne/40 shadow-xs">
                  {String(activeImageIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                </div>

                {/* Badges Overlay */}
                <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
                  {product.newArrival && (
                    <span className="bg-terracotta text-white font-sans-fashion text-[0.65rem] px-3 py-1 rounded-full font-bold tracking-widest uppercase shadow-sm">
                      NEW ARRIVAL
                    </span>
                  )}
                  <span className="sorayva-glass font-sans-fashion text-[0.65rem] px-3 py-1 rounded-full font-bold tracking-widest uppercase border border-champagne/40 text-deep-espresso">
                    {product.stockQty > 0 && product.stockQty <= 5 ? 'LIMITED STOCK' : 'SORAYVA HANDLOOM'}
                  </span>
                </div>

                {/* Circular Glass Action Buttons (Wishlist & Fullscreen Expand) */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={() => setFullscreenModalOpen(true)}
                    className="w-11 h-11 rounded-full sorayva-glass text-deep-espresso hover:text-terracotta hover:scale-105 hover:-translate-y-0.5 transition-all shadow-md flex items-center justify-center border border-champagne/40"
                    title="Expand Fullscreen"
                    aria-label="Expand Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`w-11 h-11 rounded-full sorayva-glass transition-all shadow-md flex items-center justify-center border border-champagne/40 ${
                      inWishlist
                        ? 'bg-terracotta text-white border-terracotta scale-105'
                        : 'text-deep-espresso hover:text-terracotta hover:scale-105 hover:-translate-y-0.5'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Compact Horizontal Thumbnail Slider */}
            <div className="flex sm:hidden space-x-2.5 overflow-x-auto pt-3 no-scrollbar">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-deep-espresso scale-105 shadow-md' : 'border-champagne/40 opacity-70'
                  }`}
                >
                  <ProductImage src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* CENTER: DISTINCTIVE SORAYVA SLIM GLASS COLUMN (1 Col on Desktop) */}
          <div className="hidden lg:flex lg:col-span-1 h-full min-h-[580px] flex-col items-center justify-between py-6 px-1 sorayva-glass rounded-2xl border border-champagne/30 backdrop-blur-md text-deep-espresso shadow-sm text-center">
            <span className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-terracotta uppercase">
              {String(activeImageIndex + 1).padStart(2, '0')}
            </span>

            <div className="flex flex-col items-center gap-3 my-auto">
              <span className="text-terracotta text-xs">✦</span>
              <span className="font-sans-fashion text-[0.6rem] font-bold tracking-[0.3em] uppercase text-deep-espresso/40 [writing-mode:vertical-lr] rotate-180">
                SORAYVA EDIT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
            </div>

            <span className="font-sans-fashion text-[0.65rem] font-bold tracking-widest text-deep-espresso/50 uppercase">
              {String(gallery.length).padStart(2, '0')}
            </span>
          </div>

          {/* RIGHT: STICKY PRODUCT INFORMATION AREA (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header & Meta Hierarchy */}
            <div>
              {/* SectionLabel Accent */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans-fashion text-[0.68rem] font-bold text-terracotta tracking-widest uppercase flex items-center gap-1.5">
                  <span className="text-xs">✦</span>
                  <span>{fabricLabel}</span>
                  <span className="text-deep-espresso/30">·</span>
                  <span>{occasionLabel}</span>
                </span>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-deep-espresso font-normal leading-[1.12] mb-3">
                {product.name}
              </h1>

              {/* SKU & Share Row */}
              <div className="flex items-center justify-between text-[0.7rem] font-sans-fashion text-deep-espresso/60 tracking-wider uppercase pb-3 border-b border-champagne/20">
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
                  className="hover:text-terracotta transition-colors flex items-center gap-1 font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE EDIT</span>
                </button>
              </div>

              {/* Rating & Review Count */}
              <div className="flex items-center gap-3 text-xs font-sans-body text-deep-espresso/70 mt-3">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-sand/90 border border-champagne/40">
                  <Star className="w-3.5 h-3.5 fill-champagne text-champagne" />
                  <span className="font-bold text-deep-espresso">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                </div>
                <span>({product.reviewCount || 126} verified customer reviews)</span>
              </div>
            </div>

            {/* Price Area */}
            <div className="flex items-baseline gap-4 pt-3 border-t border-champagne/30">
              <span className="font-serif-display text-3xl sm:text-4xl font-bold text-deep-espresso">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="font-sans-fashion text-base text-deep-espresso/40 line-through font-medium">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}
              {discount && (
                <span className="sorayva-glass-pill px-3 py-1 rounded-full font-sans-fashion text-xs font-bold text-terracotta uppercase tracking-wider border border-champagne/40 shadow-xs">
                  SAVE {discount}%
                </span>
              )}
            </div>

            {/* Live Stock Status Glass Pill */}
            <div className="sorayva-glass-pill rounded-full px-4 py-2 inline-flex items-center gap-2 border border-champagne/30">
              <span className={`w-2 h-2 rounded-full ${stockStatus.color} animate-pulse`} />
              <span className="font-sans-body text-xs font-semibold text-deep-espresso">{stockStatus.text}</span>
            </div>

            {/* Asymmetric Editorial Glass Information Chips */}
            <div>
              <div className="text-[0.65rem] font-sans-fashion font-bold tracking-widest text-terracotta uppercase mb-2 flex items-center gap-1.5">
                <span>✦ SPECIFICATIONS & CRAFT</span>
                <span className="flex-1 h-[1px] bg-champagne/30" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* FABRIC - Elevated Large Card */}
                <div className="col-span-2 sorayva-glass-card rounded-[14px] p-3.5 flex items-center justify-between border border-champagne/40 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-terracotta text-base font-serif-display">✦</span>
                    <div>
                      <span className="block font-sans-fashion text-[0.6rem] font-bold text-deep-espresso/60 tracking-widest uppercase">
                        FABRIC
                      </span>
                      <span className="font-sans-body text-sm font-semibold text-deep-espresso">{fabricLabel}</span>
                    </div>
                  </div>
                  <span className="font-sans-fashion text-[0.65rem] text-terracotta uppercase font-bold tracking-wider">PURE WEAVE</span>
                </div>

                {/* OCCASION */}
                <div className="sorayva-glass-card rounded-[14px] p-3 flex items-center gap-2.5 border border-champagne/40 hover:-translate-y-0.5 transition-all">
                  <span className="text-terracotta text-sm font-serif-display">✧</span>
                  <div>
                    <span className="block font-sans-fashion text-[0.58rem] font-bold text-deep-espresso/60 tracking-widest uppercase">
                      OCCASION
                    </span>
                    <span className="font-sans-body text-xs font-semibold text-deep-espresso line-clamp-1">{occasionLabel}</span>
                  </div>
                </div>

                {/* WORK */}
                <div className="sorayva-glass-card rounded-[14px] p-3 flex items-center gap-2.5 border border-champagne/40 hover:-translate-y-0.5 transition-all">
                  <span className="text-terracotta text-sm font-serif-display">◇</span>
                  <div>
                    <span className="block font-sans-fashion text-[0.58rem] font-bold text-deep-espresso/60 tracking-widest uppercase">
                      WORK / CRAFT
                    </span>
                    <span className="font-sans-body text-xs font-semibold text-deep-espresso line-clamp-1">{workLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Section */}
            <div className="space-y-3 pt-4 border-t border-champagne/30">
              <div className="flex items-center justify-between">
                <label className="font-sans-fashion text-xs font-bold uppercase tracking-wider text-deep-espresso flex items-center gap-1.5">
                  <span className="text-terracotta text-xs">◈</span>
                  <span>BLOUSE SIZE REFERENCE</span>
                </label>
                <button
                  onClick={() => setSizeModalOpen(true)}
                  className="font-sans-fashion text-xs text-terracotta hover:underline font-bold flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide ↗</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL', 'UNSTITCHED'].map((sz) => {
                  const isSelected = selectedBlouseSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedBlouseSize(sz)}
                      className={`px-4 py-2 rounded-full font-sans-fashion text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-md scale-104'
                          : 'bg-white/70 hover:bg-soft-sand text-deep-espresso border-champagne/50 hover:border-terracotta hover:-translate-y-0.5'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & CTA Buttons */}
            <div ref={mainCtaRef} className="space-y-4 pt-4 border-t border-champagne/30">
              <div className="flex items-center gap-4">
                <span className="font-sans-fashion text-xs font-bold uppercase tracking-wider text-deep-espresso">
                  QUANTITY:
                </span>
                <div className="flex items-center sorayva-glass-pill rounded-full px-3 py-1 border border-champagne/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:text-terracotta transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-sans-fashion text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:text-terracotta transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary: ADD TO BAG */}
                <button
                  onClick={handleAddToCart}
                  className="relative overflow-hidden rounded-full bg-deep-espresso text-warm-ivory py-4 px-6 font-sans-fashion text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-terracotta transition-colors shadow-lg group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>

                {/* Secondary: BUY NOW */}
                <button
                  onClick={handleBuyNow}
                  className="rounded-full bg-terracotta text-white py-4 px-6 font-sans-fashion text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:bg-deep-espresso transition-colors shadow-lg"
                >
                  BUY NOW
                </button>
              </div>
            </div>

            {/* Delivery & Pincode Glass Module */}
            <div className="sorayva-glass-card rounded-[14px] p-4 space-y-3 border border-champagne/40">
              <span className="font-sans-fashion text-xs font-bold uppercase tracking-wider block text-deep-espresso flex items-center gap-2">
                <Truck className="w-4 h-4 text-terracotta" />
                ✦ DELIVERY & PINCODE ESTIMATOR
              </span>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="flex-1 bg-white/80 border border-champagne/50 rounded-full px-4 py-2 text-xs font-sans-body text-deep-espresso focus:outline-none focus:border-terracotta"
                />
                <button
                  type="submit"
                  className="rounded-full bg-deep-espresso text-warm-ivory px-5 py-2 text-xs font-sans-fashion font-bold uppercase tracking-widest hover:bg-terracotta transition-colors"
                >
                  CHECK
                </button>
              </form>

              {shippingQuote && (
                <div className="pt-1 text-xs font-sans-body">
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
            <div className="grid grid-cols-2 gap-3 pt-2 text-[0.7rem] font-sans-fashion font-semibold tracking-wider text-deep-espresso/80 uppercase">
              <div className="flex items-center gap-2">
                <span className="text-terracotta">◈</span>
                <span>FAST DISPATCH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta">◈</span>
                <span>SECURE CHECKOUT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta">◈</span>
                <span>EASY RETURNS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta">◈</span>
                <span>QUALITY CHECKED</span>
              </div>
            </div>

            {/* WhatsApp Stylist Soft Glass Module */}
            <a
              href={`https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-full bg-emerald-800/10 hover:bg-emerald-800/20 text-emerald-800 text-xs font-sans-fashion font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-emerald-800/20 transition-all hover:-translate-y-0.5 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>◌ ASK A PERSONAL STYLIST ON WHATSAPP</span>
            </a>

            {/* Tabbed Product Accordion */}
            <div className="pt-6 border-t border-champagne/30">
              <div className="flex border-b border-champagne/30 mb-4 overflow-x-auto no-scrollbar">
                {(['description', 'care', 'shipping', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-4 font-sans-fashion text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab
                        ? 'border-terracotta text-terracotta'
                        : 'border-transparent text-deep-espresso/60 hover:text-deep-espresso'
                    }`}
                  >
                    {tab === 'description'
                      ? 'DESCRIPTION'
                      : tab === 'care'
                      ? 'FABRIC & CARE'
                      : tab === 'shipping'
                      ? 'SHIPPING & RETURNS'
                      : 'REVIEWS'}
                  </button>
                ))}
              </div>

              <div className="text-xs font-sans-body text-deep-espresso/80 leading-relaxed font-light py-2">
                {activeTab === 'description' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <p><strong>Saree Length:</strong> {product.sareeLength || '5.5 meters'}</p>
                    <p><strong>Blouse Piece:</strong> {product.blousePieceLength || '0.8 meters'} (Unstitched Included)</p>
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-serif-display font-bold text-deep-espresso">4.8</div>
                      <div>
                        <div className="flex text-champagne">★★★★★</div>
                        <span className="text-[0.7rem] text-deep-espresso/60">Based on 126 verified reviews</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span>5 ★</span>
                        <div className="flex-1 h-2 bg-soft-sand rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-terracotta" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>4 ★</span>
                        <div className="flex-1 h-2 bg-soft-sand rounded-full overflow-hidden">
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
        <div className="my-16 flex items-center justify-center gap-4 text-champagne">
          <span className="w-24 h-[1px] bg-champagne/40" />
          <span className="text-xs font-serif-display text-terracotta">✦</span>
          <span className="w-24 h-[1px] bg-champagne/40" />
        </div>

        {/* Complete the Look Carousel */}
        {relatedProducts.length > 0 && (
          <section className="pt-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-sans-fashion text-xs font-bold tracking-widest text-terracotta uppercase block mb-1">
                  ATELIER STYLING
                </span>
                <h3 className="font-serif-display text-3xl text-deep-espresso font-normal">Complete The Look</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.productId} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Carousel */}
        {recentlyViewed.length > 0 && (
          <section className="mt-16 pt-12 border-t border-champagne/30">
            <h3 className="font-serif-display text-2xl text-deep-espresso font-normal mb-8">Recently Viewed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod.productId} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FLOATING STICKY GLASS PURCHASE BAR */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 sorayva-sticky-bar py-3 px-4 sm:px-8 animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-soft-sand flex-shrink-0 hidden sm:block">
                <ProductImage src={product.mainImage} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-serif-display text-sm sm:text-base font-medium text-deep-espresso line-clamp-1">
                  {product.name}
                </h4>
                <span className="font-sans-fashion text-xs font-bold text-terracotta">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="rounded-full bg-deep-espresso text-warm-ivory px-6 py-2.5 font-sans-fashion text-xs font-bold uppercase tracking-widest hover:bg-terracotta transition-colors shadow-md"
              >
                ADD TO BAG
              </button>

              <button
                onClick={handleBuyNow}
                className="rounded-full bg-terracotta text-white px-6 py-2.5 font-sans-fashion text-xs font-bold uppercase tracking-widest hover:bg-deep-espresso transition-colors shadow-md hidden sm:block"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Gallery View Modal */}
      {fullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setFullscreenModalOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-4xl aspect-[3/4] max-h-[90vh]">
            <ProductImage
              src={gallery[activeImageIndex] || product.mainImage}
              alt={product.name}
              fill
              className="object-contain"
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
