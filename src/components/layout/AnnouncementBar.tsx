'use client';

import React from 'react';
import Link from 'next/link';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-[#1b1c1a] text-[#ede6dc] border-b border-[#302d28] py-1.5 font-sans-fashion">
      <div className="max-w-6xl w-[92%] sm:w-[86%] lg:w-[80%] mx-auto px-2 sm:px-4 flex items-center justify-between text-[0.65rem] tracking-[0.18em]">
        <div className="hidden md:flex items-center gap-2 text-[#c89b67]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          <span className="font-medium tracking-[0.18em]">ATELIER EDITION VOL. XXIV</span>
        </div>

        <div className="mx-auto text-center font-medium uppercase text-[0.6rem] sm:text-[0.65rem] tracking-[0.18em] flex items-center gap-3">
          <span>COMPLIMENTARY CONCIERGE PACKAGING &amp; WORLDWIDE EXPRESS</span>
          <span className="text-primary-container hidden sm:inline">✦</span>
          <span className="hidden sm:inline text-[#d3c4b6]">ORDERS OVER ₹15,000</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[#c89b67]/90 font-medium">
          <Link className="hover:text-primary-fixed transition-colors" href="/contact">
            FLAGSHIP SALONS
          </Link>
          <span className="text-[#443e37]">|</span>
          <Link className="hover:text-primary-fixed transition-colors" href="/shop?filter=premium">
            PREMIUM SAREES
          </Link>
        </div>
      </div>
    </div>
  );
};
