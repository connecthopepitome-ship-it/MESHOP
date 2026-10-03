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
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;

  const [product, setProduct] = useState<InternalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        if (productId) {
          const found = await repository.getAdminProductById(productId);
          if (found) {
            setProduct(found);
          } else {
            setErrorMsg(`Product ID "${productId}" was not found in the catalogue repository.`);
          }
        }
      } catch (e) {
        setErrorMsg('Error loading product data from repository.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleSave = async (updatedProduct: InternalProduct) => {
    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: updatedProduct })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTimeout(() => {
            router.push('/admin/products');
          }, 1500);
          return json;
        }
        return { success: false, error: json.error || 'Server error updating product.' };
      }
    } catch (e) {
      console.warn('API route call fallback to repository:', e);
    }

    const fallbackRes = await repository.saveOrUpdateProduct(updatedProduct);
    if (fallbackRes.success) {
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    }
    return fallbackRes;
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs uppercase tracking-widest font-mono">Fetching Saree Specifications for {productId}...</p>
        </div>
      ) : errorMsg || !product ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg max-w-lg mx-auto text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">Product Not Found</h2>
          <p className="text-xs text-slate-400 font-light">{errorMsg || 'Unable to locate requested product.'}</p>
          <Link
            href="/admin/products"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded transition-colors"
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
