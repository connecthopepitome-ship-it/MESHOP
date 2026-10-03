import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct, ProductStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product: InternalProduct = body.product || body;

    if (!product.productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update.' }, { status: 400 });
    }

    if (product.price !== undefined && (isNaN(product.price) || product.price < 0)) {
      return NextResponse.json({ success: false, error: 'Price must be a non-negative number.' }, { status: 400 });
    }

    if (product.compareAtPrice !== undefined && product.compareAtPrice !== null && product.compareAtPrice < 0) {
      return NextResponse.json({ success: false, error: 'Compare At Price must be non-negative.' }, { status: 400 });
    }

    if (product.stock !== undefined && (isNaN(product.stock) || product.stock < 0)) {
      return NextResponse.json({ success: false, error: 'Stock count must be a non-negative integer.' }, { status: 400 });
    }

    if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
      return NextResponse.json({ success: false, error: 'Rating must be between 0 and 5.' }, { status: 400 });
    }

    if (product.status) {
      const validStatuses: ProductStatus[] = ['Draft', 'Active', 'Out of Stock', 'Hidden', 'Discontinued'];
      if (!validStatuses.includes(product.status)) {
        return NextResponse.json({ success: false, error: 'Invalid product status.' }, { status: 400 });
      }
    }

    // Call Repository mutation
    const result = await repository.saveOrUpdateProduct(product);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update product.' }, { status: 500 });
    }

    // Automatically invalidate cache
    await repository.clearCatalogueCache();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully in Google Sheets.',
      productId: product.productId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
