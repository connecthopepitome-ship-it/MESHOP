'use client';

import React from 'react';
import Link from 'next/link';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-[#1b1c1a] text-[#ede6dc] border-b border-[#302d28] py-2.5 px-4 sm:px-8 text-xs tracking-[0.2em] font-sans-fashion flex items-center justify-between">
      <div className="hidden md:flex items-center gap-2 text-[0.6875rem] text-[#c89b67]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
        <span className="font-medium tracking-[0.2em]">ATELIER EDITION VOL. XXIV</span>
      </div>

      <div className="mx-auto text-center font-medium uppercase text-[0.6875rem] sm:text-xs tracking-[0.2em] flex items-center gap-3">
        <span>COMPLIMENTARY CONCIERGE PACKAGING &amp; WORLDWIDE EXPRESS</span>
        <span className="text-primary-container hidden sm:inline">✦</span>
        <span className="hidden sm:inline text-[#d3c4b6]">ORDERS OVER ₹15,000</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-[0.6875rem] tracking-[0.2em] text-[#c89b67]/90 font-medium">
        <Link className="hover:text-primary-fixed transition-colors" href="/contact">
          FLAGSHIP SALONS
        </Link>
        <span className="text-[#443e37]">|</span>
        <Link className="hover:text-primary-fixed transition-colors" href="/shop/bridal">
          BESPOKE BRIDAL
        </Link>
      </div>
    </div>
  );
};
