import { repository } from '@/lib/api/googleSheetsRepository';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const products = await repository.getProducts({});
  return products.map((product) => ({
    slug: product.slug || product.productId.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await repository.getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.name} | SORAYVA`,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, allProducts] = await Promise.all([
    repository.getProductBySlug(params.slug),
    repository.getProducts({})
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient 
      initialProduct={product} 
      allProducts={allProducts} 
      slug={params.slug} 
    />
  );
}
