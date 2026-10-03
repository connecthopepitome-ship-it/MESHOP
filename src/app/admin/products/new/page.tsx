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
      const json = await res.json();
      if (res.ok && json.success) {
        setTimeout(() => {
          router.push('/admin/products');
        }, 1200);
        return json;
      }
      return { success: false, error: json.error || 'Server error creating product in Google Sheets.' };
    } catch (e: any) {
      return { success: false, error: `Connection error: ${e.message}` };
    }
  };

  return (
    <AdminLayout>
      <ProductForm isEdit={false} onSave={handleSave} />
    </AdminLayout>
  );
}
