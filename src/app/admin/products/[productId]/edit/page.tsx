'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.productId;
  const productId = Array.isArray(rawId) ? rawId[0] : (rawId ?? '');

  const [product, setProduct] = useState<InternalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        if (productId) {
          const res = await fetch('/api/admin/products');
          const json = await res.json();
          if (res.ok && json.success && Array.isArray(json.products)) {
            const merged = repository.applyClientOverrides<InternalProduct>(json.products);
            const found = merged.find((p: InternalProduct) => p.productId.toLowerCase() === productId.trim().toLowerCase());
            if (found) {
              setProduct(found);
            } else {
              setErrorMsg(`Product ID "${productId}" was not found in the Google Sheets catalogue.`);
            }
          } else {
            setErrorMsg(json.error || 'Failed to load product data from Google Sheets.');
          }
        }
      } catch (e: any) {
        setErrorMsg(`Error loading product data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleSave = async (updatedProduct: InternalProduct) => {
    try {
      // 1. Synchronously call server update API
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedProduct })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to update product in Google Sheets.' };
      }

      // 2. Persist update in local repository stores
      await repository.saveOrUpdateProduct(updatedProduct);

      // 3. Read back from persistence to confirm saved state
      const reloadedRes = await fetch('/api/admin/products');
      if (reloadedRes.ok) {
        const reloadedJson = await reloadedRes.json();
        if (reloadedJson.success && Array.isArray(reloadedJson.products)) {
          const merged = repository.applyClientOverrides<InternalProduct>(reloadedJson.products);
          const confirmed = merged.find(
            (p: InternalProduct) => p.productId.toLowerCase() === updatedProduct.productId.toLowerCase()
          );
          if (confirmed) {
            setProduct(confirmed);
          }
        }
      }

      setTimeout(() => {
        router.push('/admin/products');
      }, 900);

      return { success: true, message: 'Product updated and verified in catalogue.' };
    } catch (e: any) {
      return { success: false, error: `Connection error: ${e.message}` };
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="p-16 text-center text-brand-muted space-y-4 animate-fadeIn">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta mx-auto" />
          <p className="text-xs uppercase tracking-widest font-sans font-semibold">Fetching Saree Specifications for {productId}...</p>
        </div>
      ) : errorMsg || !product ? (
        <div className="bg-white border border-brand-border p-8 rounded-2xl max-w-lg mx-auto text-center space-y-5 shadow-sm animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-2xl font-serif-editorial font-medium text-deep-espresso">Product Not Found</h2>
          <p className="text-sm text-brand-muted font-sans font-light leading-relaxed">{errorMsg || 'Unable to locate requested product.'}</p>
          <Link
            href="/admin/products"
            className="inline-block bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Return to Catalogue Table
          </Link>
        </div>
      ) : (
        <ProductForm initialData={product} isEdit={true} onSave={handleSave} />
      )}
    </AdminLayout>
  );
}
