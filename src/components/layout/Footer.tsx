'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant pt-space-3xl pb-space-xl font-sans">
      <div className="w-full px-margin md:px-margin-tablet xl:px-margin-desktop">
        {/* Atelier Gazette Newsletter */}
        <div className="max-w-2xl mx-auto text-center mb-space-3xl">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/images/sorayva-logo.png"
              alt="SORAYVA - The Modern Saree House"
              width={220}
              height={60}
              className="h-12 w-auto object-contain mx-auto"
            />
          </Link>
          <span className="font-subhead-eyebrow text-subhead-eyebrow text-primary uppercase tracking-[0.25em] block mb-space-sm font-semibold">
            The Atelier Gazette
          </span>
          <h3 className="font-headline-md text-headline-md text-secondary font-normal mb-space-sm">
            Private Previews &amp; Heritage Dispatches
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
            Be the first to view limited seasonal weaves, archival exhibitions, and private couture showcases.
          </p>
          {subscribed ? (
            <div className="p-4 bg-surface-container border border-primary-container text-primary font-body-sm text-center">
              ✦ Thank you for joining the SORAYVA Atelier Circle.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-space-sm max-w-md mx-auto">
              <input
                className="w-full bg-surface border border-outline-variant px-space-md py-3 text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your email address"
                type="email"
                required
              />
              <button
                className="w-full sm:w-auto px-space-xl py-3 bg-secondary text-on-secondary font-label-uppercase text-label-uppercase hover:bg-primary transition-colors whitespace-nowrap"
                type="submit"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-desktop mb-space-3xl border-y border-outline-variant py-space-2xl">
          <div>
            <h4 className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-[0.2em] mb-space-md font-semibold">
              Boutique Collections
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop">
                  Kashi Banarasi Weaves
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/silk">
                  Pure Mulberry Kanjivaram
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/organza">
                  Lightweight Organza &amp; Chanderi
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop">
                  The Royal Trousseau
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-[0.2em] mb-space-md font-semibold">
              Client Care
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary transition-colors" href="/shipping-and-returns">
                  Worldwide White-Glove Courier
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/authenticity">
                  Silk Mark &amp; Hallmark Authenticity
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/care-guide">
                  Preservation &amp; Saree Care
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/contact">
                  Atelier Concierge Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-[0.2em] mb-space-md font-semibold">
              Bespoke Styling
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary transition-colors" href="/virtual-consult">
                  Private Virtual Appointments
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/size-guide">
                  Custom Blouse &amp; Tailoring
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/bridal-consultancy">
                  Bridal Registry &amp; Curation
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/lookbook">
                  The Seasonal Lookbook
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-[0.2em] mb-space-md font-semibold">
              The Saree House Story
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link className="hover:text-primary transition-colors" href="/our-story">
                  Our Loom Craftsmanship
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/master-weavers">
                  Master Artisan Guilds
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/ethical-zari">
                  Traceable Gold &amp; Silver Zarí
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/contact">
                  Visit the Flagship Atelier
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Security */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md pt-space-sm">
          <div className="flex items-center gap-space-md text-on-surface-variant text-xs">
            <span>🔒 ENCRYPTED ATELIER CHECKOUT</span>
            <span>✦ Razorpay • UPI • COD Supported</span>
          </div>
          <div className="text-center md:text-right">
            <p className="font-subhead-eyebrow text-subhead-eyebrow text-on-surface-variant uppercase tracking-[0.15em]">
              © {new Date().getFullYear()} SORAYVA LUXURY TEXTILES &amp; ATELIER HOUSE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
