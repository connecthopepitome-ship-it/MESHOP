'use client';

import React from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-warm-ivory text-deep-espresso">
      <h1 className="font-serif-display text-3xl font-semibold mb-3">SORAYVA Atelier Error</h1>
      <p className="font-sans-body text-sm text-deep-espresso/70 max-w-md mb-6 leading-relaxed">
        An unexpected issue occurred. Please try again or return to the storefront.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-full bg-deep-espresso text-warm-ivory font-sans-fashion text-xs font-bold uppercase tracking-widest hover:bg-terracotta transition-colors shadow-md"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-full sorayva-glass text-deep-espresso border border-champagne/40 font-sans-fashion text-xs font-bold uppercase tracking-widest hover:border-terracotta transition-colors"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
