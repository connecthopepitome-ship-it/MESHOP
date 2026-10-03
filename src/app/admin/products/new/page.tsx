'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct } from '@/types';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = async (product: InternalProduct) => {
    try {
      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTimeout(() => {
            router.push('/admin/products');
          }, 1500);
          return json;
        }
        return { success: false, error: json.error || 'Server error creating product.' };
      }
    } catch (e) {
      console.warn('API route call fallback to repository:', e);
    }

    const fallbackRes = await repository.saveOrUpdateProduct(product);
    if (fallbackRes.success) {
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    }
    return fallbackRes;
  };

  return (
    <AdminLayout>
      <ProductForm isEdit={false} onSave={handleSave} />
    </AdminLayout>
  );
}
