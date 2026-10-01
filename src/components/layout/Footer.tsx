'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-charcoal text-brand-base border-t border-brand-charcoal/20 pt-16 pb-12 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-border/20">
          {/* Col 1: Brand Info */}
          <div>
            <span className="font-serif text-2xl tracking-widest uppercase text-brand-base block font-semibold">
              ROYAL SILKS
            </span>
            <p className="mt-4 text-xs leading-relaxed text-brand-base/70">
              Curated luxury Indian sarees handcrafted by master weavers across Kanchipuram, Varanasi, and Chanderi. Timeless drapes for life’s most cherished celebrations.
            </p>
            <div className="mt-6 flex items-center space-x-4 text-xs text-brand-gold">
              <span>✓ Silk Mark Certified</span>
              <span>✓ Handloom Authenticity</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-brand-gold mb-4">Storefront</h4>
            <ul className="space-y-2.5 text-xs text-brand-base/80">
              <li>
                <Link href="/shop" className="hover:text-brand-gold transition-colors">Shop All Sarees</Link>
              </li>
              <li>
                <Link href="/shop/silk" className="hover:text-brand-gold transition-colors">Kanjeevaram & Banarasi Silk</Link>
              </li>
              <li>
                <Link href="/shop/organza" className="hover:text-brand-gold transition-colors">Organza & Tissue</Link>
              </li>
              <li>
                <Link href="/collections/signature-edit" className="hover:text-brand-gold transition-colors">Heritage Collection</Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-brand-gold transition-colors">Blouse Size Identifier</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-gold transition-colors">Order Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-brand-gold mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-brand-base/80">
              <li>
                <Link href="/shipping-and-returns" className="hover:text-brand-gold transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link href="/shipping-and-returns" className="hover:text-brand-gold transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-gold transition-colors">Boutique Concierge Contact</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-gold transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-brand-gold transition-colors">Refund Policy</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Concierge */}
          <div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-brand-gold mb-4">Boutique Circle</h4>
            <p className="text-xs text-brand-base/70 mb-4">
              Subscribe to receive private collection previews, silk care guides, and exclusive festive invitations.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for joining the Royal Silks Circle!'); }} className="flex">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full bg-brand-base/10 border border-brand-border/30 px-3 py-2 text-xs text-brand-base focus:outline-none focus:border-brand-gold"
                required
              />
              <button type="submit" className="bg-brand-gold text-brand-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-brand-gold-hover transition-colors">
                Join
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-brand-border/20 text-xs">
              <span className="text-brand-base/60 block mb-1">WhatsApp Personal Stylist:</span>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="text-brand-gold hover:underline font-medium"
              >
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-brand-base/60 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} ROYAL SILKS BOUTIQUE. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-xs">
            <span>🔒 256-Bit SSL Encrypted Checkout</span>
            <span>💳 Razorpay • UPI • COD Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
