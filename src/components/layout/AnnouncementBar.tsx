'use client';

import React from 'react';
import Link from 'next/link';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-[#1b1c1a] text-[#ede6dc] border-b border-[#302d28] py-1 font-sans-fashion overflow-hidden">
      <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-2 sm:px-4 flex items-center justify-between text-[9px] sm:text-[10px] leading-none tracking-[0.18em] whitespace-nowrap">
        <div className="hidden md:flex items-center gap-1.5 text-[#c89b67] flex-shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          <span className="font-semibold tracking-[0.18em] uppercase">ATELIER EDITION VOL. XXIV</span>
        </div>

        <div className="mx-auto text-center font-medium uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 sm:gap-3 text-warm-ivory/90 leading-none">
          <span>COMPLIMENTARY CONCIERGE PACKAGING &amp; WORLDWIDE EXPRESS</span>
          <span className="text-terracotta hidden sm:inline text-[8px]">✦</span>
          <span className="hidden sm:inline text-[#d3c4b6]">ORDERS OVER ₹15,000</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[#c89b67]/90 font-semibold uppercase leading-none flex-shrink-0">
          <Link className="hover:text-terracotta transition-colors whitespace-nowrap" href="/contact">
            FLAGSHIP SALONS
          </Link>
          <span className="text-[#443e37] font-normal">|</span>
          <Link className="hover:text-terracotta transition-colors whitespace-nowrap font-bold text-terracotta" href="/#premium-sarees">
            PREMIUM SAREES
          </Link>
        </div>
      </div>
    </div>
  );
};
