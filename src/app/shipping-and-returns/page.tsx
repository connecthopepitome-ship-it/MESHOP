import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ShippingAndReturnsPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-brand-border pb-6">
        <span className="text-xs font-semibold tracking-widest text-brand-gold uppercase">Boutique Guarantee</span>
        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal font-medium">Shipping & Returns</h1>
        <p className="text-xs text-brand-muted">Transparent delivery timelines, insured transit, and hassle-free returns.</p>
      </div>

      <div className="space-y-8 text-xs text-brand-muted leading-relaxed">
        <section className="bg-brand-surface p-6 border border-brand-border space-y-3">
          <h2 className="font-serif text-lg font-semibold text-brand-charcoal uppercase tracking-wider flex items-center">
            <Truck className="w-5 h-5 text-brand-gold mr-2" /> Shipping & Dispatch Policy
          </h2>
          <p>• <strong>Domestic Shipping:</strong> All domestic orders within India ship via express air courier (Shiprocket / Blue Dart). Orders over ₹10,000 qualify for complimentary express delivery.</p>
          <p>• <strong>Dispatch Timelines:</strong> Standard sarees dispatch within 24 to 48 hours of order confirmation. Custom pre-stitched or tailored blouse orders dispatch within 4 to 6 business days.</p>
          <p>• <strong>Transit Duration:</strong> Metro cities: 2–3 business days. Rest of India: 3–5 business days.</p>
        </section>

        <section className="bg-brand-surface p-6 border border-brand-border space-y-3">
          <h2 className="font-serif text-lg font-semibold text-brand-charcoal uppercase tracking-wider flex items-center">
            <RefreshCw className="w-5 h-5 text-brand-gold mr-2" /> 7-Day Easy Return & Exchange Policy
          </h2>
          <p>• We offer a hassle-free 7-day return policy from the date of package delivery.</p>
          <p>• Items must be unwashed, unworn, with all original Silk Mark tags intact in original boutique packaging.</p>
          <p>• Custom stitched blouses or fall-piku finished sarees are non-returnable unless defective.</p>
        </section>
      </div>
    </div>
  );
}
