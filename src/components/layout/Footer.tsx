'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="w-full bg-[#1b1c1a] text-[#ede6dc] pt-20 pb-12 border-t border-[#302d28]">
      <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-4 sm:px-6 md:px-8">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center pb-16 border-b border-[#302d28]">
          <span className="font-sans-fashion text-xs tracking-[0.25em] text-primary-container uppercase font-semibold block mb-2">
            ATELIER DISPATCHES
          </span>
          <h3 className="font-serif-display text-3xl sm:text-4xl text-[#fdfbf7] font-normal mb-3">
            The Saree Gazette
          </h3>
          <p className="font-serif-editorial italic text-lg text-[#d3c4b6] mb-8 font-light leading-relaxed">
            Receive private invitations to limited loom rollouts, archival trunk shows, and bespoke bridal curations.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-full bg-[#272420] border border-primary-container text-primary-fixed text-xs font-sans-fashion tracking-widest uppercase">
              ✦ Thank you for joining the SORAYVA Atelier Gazette.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input
                className="w-full h-12 bg-[#272420] border border-[#443e37] px-5 text-sm text-[#fdfbf7] placeholder:text-[#817569] focus:outline-none focus:border-primary-container transition-colors rounded-full sm:rounded-r-none font-sans-body leading-none"
                placeholder="Enter your email address"
                type="email"
                required
              />
              <button
                className="w-full sm:w-auto h-12 px-8 bg-primary-container text-white font-sans-fashion text-xs tracking-[0.2em] uppercase rounded-full sm:rounded-l-none hover:bg-primary transition-colors whitespace-nowrap inline-flex items-center justify-center font-medium"
                type="submit"
              >
                REQUEST INVITATION
              </button>
            </form>
          )}
        </div>

        {/* 4 Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-[#302d28]">
          <div>
            <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.2em] text-primary-container uppercase mb-5">
              THE ARCHIVE
            </h4>
            <ul className="space-y-3 font-sans-body text-xs text-[#d3c4b6]/80 font-light">
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop/silk">
                  Pure Kanchipuram Silks
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop/banarasi">
                  Varanasi Katan Brocades
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop/organza">
                  Hand-Woven Tissue Organza
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop/chanderi">
                  Artisanal Chanderi Pattu
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop/bridal">
                  Royal Wedding Trousseau
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.2em] text-primary-container uppercase mb-5">
              CLIENT CARE
            </h4>
            <ul className="space-y-3 font-sans-body text-xs text-[#d3c4b6]/80 font-light">
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/authenticity">
                  Silk Mark &amp; Purity Hallmark
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shipping-and-returns">
                  Worldwide White-Glove Transit
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/care-guide">
                  Saree Preservation Guide
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shipping-and-returns">
                  Atelier Exchange Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/track-order">
                  Track Your Consignment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.2em] text-primary-container uppercase mb-5">
              BESPOKE SERVICES
            </h4>
            <ul className="space-y-3 font-sans-body text-xs text-[#d3c4b6]/80 font-light">
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="#concierge">
                  Virtual Drape Consultation
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/size-guide">
                  Made-to-Order Blouse Atelier
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/shop?filter=premium">
                  Premium Saree Atelier &amp; Trousseau
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/contact">
                  Corporate Gifting Connoisseur
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary-fixed transition-colors" href="/contact">
                  Salon Private Viewings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans-fashion text-xs font-semibold tracking-[0.2em] text-primary-container uppercase mb-5">
              ATELIER HOUSES
            </h4>
            <p className="font-sans-body text-xs text-[#d3c4b6]/80 font-light leading-relaxed mb-3">
              Flagship Atelier: 18 Heritage Avenue, Colaba, Mumbai 400001
            </p>
            <p className="font-sans-body text-xs text-[#d3c4b6]/80 font-light leading-relaxed mb-4">
              Private Salon: Mehrauli Heritage Quarter, New Delhi 110030
            </p>
            <p className="font-sans-fashion text-xs text-primary-container tracking-wider">
              concierge@sorayva.com • +91 22 8904 2200
            </p>
          </div>
        </div>

        {/* Bottom Legal Security */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans-fashion text-[#817569]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-container">lock</span>
              <span className="tracking-wider">256-BIT ENCRYPTED ATELIER GATEWAY</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline tracking-wider">AUTHENTIC HANDLOOM SILK MARK</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/admin/login" className="tracking-wider text-[#d3c4b6]/60 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
              <span>ADMIN PORTAL</span>
            </Link>
          </div>
          <p className="tracking-wider">
            © {new Date().getFullYear()} SORAYVA LUXURY TEXTILES &amp; ATELIER HOUSE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};
