import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-4xl space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Heritage Craftsmanship</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">The Royal Silks Story</h1>
        <p className="text-xs text-brand-muted">Preserving centuries of Indian weaving traditions for the modern connoisseur.</p>
      </div>

      <div className="relative aspect-[21/9] w-full bg-brand-surface border border-brand-border overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"
          alt="Artisan Saree Weaving"
          fill
          className="object-cover object-center opacity-85"
        />
      </div>

      <div className="space-y-6 text-xs md:text-sm text-brand-muted leading-relaxed font-light">
        <p>
          Founded with a singular commitment to pure Indian textiles, <strong className="text-brand-charcoal font-semibold">ROYAL SILKS BOUTIQUE</strong> bridges ancient handloom weaving clusters with discerning women worldwide.
        </p>
        <p>
          Every saree in our collection tells a sacred story of patient craftsmanship. From the legendary <em>korvai</em> interlocking weaving technique of Kanchipuram to the ethereal <em>kadwa</em> floral motifs of Varanasi and the delicate hand-painted motifs of tissue organza, we honor the master artisans whose hands preserve our rich living heritage.
        </p>
        <div className="p-6 bg-brand-surface border-l-4 border-brand-gold italic text-brand-charcoal font-serif text-base">
          "A saree is not merely a garment—it is a living tapestry woven with tradition, memory, and grace."
        </div>
      </div>
    </div>
  );
}
