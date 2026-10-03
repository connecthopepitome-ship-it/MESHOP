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
    const res = await repository.saveOrUpdateProduct(product);
    if (res.success) {
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    }
    return res;
  };

  return (
    <AdminLayout>
      <ProductForm isEdit={false} onSave={handleSave} />
    </AdminLayout>
  );
}
