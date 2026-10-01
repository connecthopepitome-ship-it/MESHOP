'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatalogView } from '@/components/catalog/CatalogView';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <CatalogView
      title={`Search Results for "${query}"`}
      subtitle="Refine search by fabric, weave, occasion, or price point."
      initialSearchQuery={query}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-xs">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
