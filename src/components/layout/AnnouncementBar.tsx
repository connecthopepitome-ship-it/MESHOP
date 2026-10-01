'use client';

import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-brand-charcoal text-brand-base text-xs font-sans tracking-widest uppercase py-2 px-4 text-center border-b border-brand-charcoal/20">
      <div className="container mx-auto flex items-center justify-between">
        <span className="hidden md:inline text-[11px] opacity-80">Handcrafted Indian Boutique Heritage</span>
        <p className="font-medium mx-auto md:mx-0">
          Complimentary Express Worldwide Shipping on Orders Above ₹10,000
        </p>
        <span className="hidden md:inline text-[11px] opacity-80">100% Verified Silk & Handloom Certified</span>
      </div>
    </div>
  );
};
