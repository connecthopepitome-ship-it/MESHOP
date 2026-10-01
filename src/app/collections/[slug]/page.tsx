import { CatalogView } from '@/components/catalog/CatalogView';

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const formattedTitle = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <CatalogView
      title={formattedTitle}
      subtitle="Curated boutique edit showcasing timeless craftsmanship and luxury drapes."
      initialCollection={params.slug}
    />
  );
}
