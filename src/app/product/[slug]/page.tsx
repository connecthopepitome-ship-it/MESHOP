'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, ShoppingBag, Truck, ShieldCheck, Ruler, MessageCircle, Star, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { repository } from '@/lib/api/googleSheetsRepository';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { defaultShippingProvider } from '@/lib/adapters/shippingAdapter';
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
        if (prod && prod.blouseSizesAvailable?.length > 0) {
          setSelectedBlouseSize(prod.blouseSizesAvailable[0]);
        }
        if (prod) {
          trackEvent('view_item', { productId: prod.productId, name: prod.name, price: prod.price });
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
      <div className="container mx-auto px-4 md:px-8 py-16 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[3/4] bg-brand-surface border border-brand-border" />
          <div className="space-y-4">
            <div className="h-6 bg-brand-surface w-1/3" />
            <div className="h-10 bg-brand-surface w-3/4" />
            <div className="h-8 bg-brand-surface w-1/4" />
            <div className="h-32 bg-brand-surface w-full" />
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

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16">
      {/* Inject Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <nav className="text-xs text-brand-muted font-sans uppercase tracking-wider flex items-center space-x-2">
        <Link href="/" className="hover:text-brand-gold">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-gold">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-brand-gold">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-brand-charcoal font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left: Product Images Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-brand-surface border border-brand-border overflow-hidden">
            <Image
              src={gallery[activeImageIndex] || product.mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />

            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 z-10 p-3 rounded-full bg-brand-base/80 backdrop-blur-md text-brand-charcoal hover:text-brand-burgundy transition-colors shadow-md"
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-brand-burgundy text-brand-burgundy' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 aspect-[3/4] border transition-all flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-brand-gold ring-2 ring-brand-gold' : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 text-brand-charcoal">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase block">
              {product.fabric} • {product.category}
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-medium mt-1 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-brand-muted mt-1 font-sans">SKU: {product.sku}</p>
          </div>

          {/* Price & Badges */}
          <div className="flex items-baseline space-x-4 pt-2 border-t border-brand-border">
            <span className="font-sans text-2xl md:text-3xl font-bold text-brand-charcoal">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans text-base text-brand-muted line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
            {discount && (
              <span className="bg-brand-burgundy text-white text-xs font-bold px-2.5 py-1">
                Save {discount}%
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-brand-muted leading-relaxed font-light">
            {product.shortDescription || product.description}
          </p>

          {/* Blouse Size Selector */}
          {product.blouseSizesAvailable && product.blouseSizesAvailable.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-brand-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider">
                  Select Unstitched Blouse Size:
                </label>
                <button
                  onClick={() => setSizeModalOpen(true)}
                  className="text-xs text-brand-gold font-medium hover:underline flex items-center space-x-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Blouse Size Assistant</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.blouseSizesAvailable.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedBlouseSize(sz)}
                    className={`w-11 h-11 text-xs font-semibold uppercase border transition-all ${
                      selectedBlouseSize === sz
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

          {/* Quantity & CTAs */}
          <div className="space-y-4 pt-4 border-t border-brand-border">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-brand-border bg-brand-surface">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-semibold hover:bg-brand-border transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                  className="px-3 py-1.5 text-sm font-semibold hover:bg-brand-border transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-brand-gold font-medium">
                {product.stockQty > 0 ? `In Stock (${product.stockQty} left)` : 'Out of Stock'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover py-4 px-6 text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-brand-charcoal text-brand-base hover:bg-black py-4 px-6 text-xs font-semibold uppercase tracking-widest flex items-center justify-center transition-colors shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Pincode Shipping Checker */}
          <div className="p-4 bg-brand-surface border border-brand-border/60 space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider block text-brand-charcoal flex items-center">
              <Truck className="w-4 h-4 mr-1.5 text-brand-gold" /> Check Delivery & PIN Code
            </span>
            <form onSubmit={handlePincodeCheck} className="flex">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 110054)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="w-full bg-brand-base border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                className="bg-brand-charcoal text-brand-base px-4 text-xs uppercase font-semibold hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
              >
                Check
              </button>
            </form>

            {shippingQuote && (
              <div className="pt-2 text-xs">
                {shippingQuote.servicable ? (
                  <p className="text-green-800 font-medium">
                    ✓ Servicable! Estimated Delivery: <strong>{shippingQuote.estimatedDays}</strong> ({shippingQuote.cost === 0 ? 'Complimentary Free Shipping' : `Shipping ₹${shippingQuote.cost}`})
                  </p>
                ) : (
                  <p className="text-brand-burgundy font-medium">
                    ✕ Invalid PIN code format. Please check your 6-digit pincode.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* WhatsApp Concierge Action */}
          <div className="p-4 border border-brand-gold/40 bg-brand-gold/10 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-brand-charcoal block">Need Styling Assistance?</span>
              <span className="text-brand-muted">Ask our boutique draper about video calls & fabric feel.</span>
            </div>
            <a
              href={`https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-green-700 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-green-800 transition-colors flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Accordion Tabs */}
          <div className="border-t border-brand-border pt-4 text-xs space-y-3">
            <div className="border border-brand-border">
              <button
                onClick={() => setActiveTab(activeTab === 'details' ? ('' as any) : 'details')}
                className="w-full p-3 font-semibold uppercase tracking-wider text-left bg-brand-surface flex justify-between items-center"
              >
                <span>Product Specifications & Weave</span>
                {activeTab === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeTab === 'details' && (
                <div className="p-4 space-y-2 text-brand-muted bg-brand-base">
                  <p><strong>Fabric:</strong> {product.fabric}</p>
                  <p><strong>Saree Length:</strong> {product.sareeLength}</p>
                  <p><strong>Blouse Piece:</strong> {product.blousePieceLength} ({product.blouseIncluded ? 'Included' : 'Not included'})</p>
                  <p><strong>Occasion:</strong> {product.occasion}</p>
                  <p><strong>Craft Work:</strong> {product.workType}</p>
                  <p><strong>Pattern:</strong> {product.pattern}</p>
                </div>
              )}
            </div>

            <div className="border border-brand-border">
              <button
                onClick={() => setActiveTab(activeTab === 'care' ? ('' as any) : 'care')}
                className="w-full p-3 font-semibold uppercase tracking-wider text-left bg-brand-surface flex justify-between items-center"
              >
                <span>Silk Preservation & Care Instructions</span>
                {activeTab === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeTab === 'care' && (
                <div className="p-4 text-brand-muted bg-brand-base leading-relaxed">
                  {product.careInstructions || 'Dry clean only. Store wrapped in pure white cotton cloth in a cool, dry place. Avoid direct sunlight and perfume contact.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-base border-t border-brand-border p-3 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-brand-muted uppercase block">Total Price</span>
          <span className="font-serif text-base font-bold text-brand-charcoal">{formatPrice(product.price)}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover px-6 py-3 text-xs uppercase tracking-widest font-semibold"
        >
          Add to Bag
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
