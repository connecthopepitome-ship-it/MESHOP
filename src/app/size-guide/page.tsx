'use client';

import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { BlouseSizeModal } from '@/components/size/BlouseSizeModal';
import { BLOUSE_SIZE_CHART } from '@/data/sizeChart';

export default function SizeGuidePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase flex items-center justify-center">
          <Ruler className="w-4 h-4 mr-1.5" /> Tailoring & Fit Architecture
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Saree & Blouse Size Guide</h1>
        <p className="text-xs md:text-sm text-brand-muted font-light">
          All Royal Silks sarees are standard 5.5-meter drapes with an unstitched 0.8-meter matching blouse piece featuring generous 2-inch side alteration margins.
        </p>
      </div>

      <div className="bg-brand-surface p-8 border border-brand-border text-center space-y-4">
        <h2 className="font-serif text-xl font-medium text-brand-charcoal">Interactive Blouse Size Assistant</h2>
        <p className="text-xs text-brand-muted max-w-md mx-auto">
          Need a precise recommendation based on your bust and waist measurements? Launch our tailoring calculator.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold-hover px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
        >
          Launch Size Assistant
        </button>
      </div>

      {/* Full Reference Table */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-brand-charcoal uppercase tracking-wider">
          Standard Blouse Measurement Table (Inches)
        </h3>
        <div className="overflow-x-auto border border-brand-border bg-brand-base">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border font-semibold uppercase text-brand-charcoal">
                <th className="p-3">Size</th>
                <th className="p-3">Bust Range</th>
                <th className="p-3">Waist Range</th>
                <th className="p-3">Shoulder</th>
                <th className="p-3">Sleeve Length</th>
                <th className="p-3">Ready Garment Bust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-muted">
              {BLOUSE_SIZE_CHART.map((row) => (
                <tr key={row.size} className="hover:bg-brand-surface/60 transition-colors">
                  <td className="p-3 font-bold text-brand-charcoal">{row.size}</td>
                  <td className="p-3">{row.bustRangeInches[0]}" - {row.bustRangeInches[1]}"</td>
                  <td className="p-3">{row.waistRangeInches[0]}" - {row.waistRangeInches[1]}"</td>
                  <td className="p-3">{row.shoulderInches}"</td>
                  <td className="p-3">{row.sleeveLengthInches}"</td>
                  <td className="p-3 font-semibold text-brand-charcoal">{row.readyGarmentBustInches}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BlouseSizeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
