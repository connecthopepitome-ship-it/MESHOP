import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-24 text-center space-y-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">404 Page Not Found</span>
      <h1 className="font-serif text-4xl md:text-6xl text-brand-charcoal font-medium">Page Unavailable</h1>
      <p className="text-xs md:text-sm text-brand-muted max-w-md mx-auto font-light">
        The saree curation or page you are looking for may have been updated or moved.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-brand-charcoal text-brand-base px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-charcoal transition-colors"
      >
        Return to Storefront Catalogue
      </Link>
    </div>
  );
}
