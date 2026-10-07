'use client';

import React from 'react';
import Link from 'next/link';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-deep-espresso text-warm-ivory border-b border-champagne/20 font-sans-fashion overflow-hidden h-[30px] flex items-center z-40">
      <div className="max-w-7xl w-[94%] sm:w-[90%] lg:w-[85%] mx-auto px-3 flex items-center justify-between text-[10px] sm:text-[11px] tracking-[0.18em] uppercase whitespace-nowrap">
        <div className="hidden md:flex items-center gap-1.5 text-champagne flex-shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
          <span className="font-bold">ATELIER EDITION VOL. XXIV</span>
        </div>

        <div className="mx-auto text-center font-medium uppercase tracking-[0.18em] text-warm-ivory/90 truncate px-2">
          <span>COMPLIMENTARY CONCIERGE PACKAGING &amp; WORLDWIDE EXPRESS</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-champagne font-bold uppercase flex-shrink-0">
          <Link className="hover:text-terracotta transition-colors" href="/contact">
            FLAGSHIP SALONS
          </Link>
          <span className="text-champagne/40">|</span>
          <Link className="hover:text-terracotta transition-colors text-terracotta" href="/#premium-sarees">
            PREMIUM SAREES
          </Link>
        </div>
      </div>
    </div>
  );
};
