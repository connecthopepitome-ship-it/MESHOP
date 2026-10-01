import { CatalogView } from '@/components/catalog/CatalogView';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const formattedTitle = params.category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <CatalogView
      title={`${formattedTitle} Sarees`}
      subtitle={`Handwoven ${formattedTitle} creations crafted by heritage artisan guilds.`}
      initialCategory={params.category}
    />
  );
}
