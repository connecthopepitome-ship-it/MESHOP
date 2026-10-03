import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct, ProductStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product: InternalProduct = body.product || body;

    // Validate required fields
    if (!product.productName && !product.name) {
      return NextResponse.json({ success: false, error: 'Product Name is required.' }, { status: 400 });
    }

    if (!product.category) {
      return NextResponse.json({ success: false, error: 'Category is required.' }, { status: 400 });
    }

    if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
      return NextResponse.json({ success: false, error: 'Price must be a non-negative number.' }, { status: 400 });
    }

    const status: ProductStatus = product.status || 'Draft';
    if (!['Draft', 'Active', 'Out of Stock', 'Hidden', 'Discontinued'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid product status.' }, { status: 400 });
    }

    // Active status validation rules
    if (status === 'Active') {
      const mainImg = product.mainImage || (product.images && product.images[0]);
      if (!mainImg) {
        return NextResponse.json({ success: false, error: 'Main Image URL is required for Active publishing.' }, { status: 400 });
      }
    }

    // Auto-generate Product ID if missing
    if (!product.productId) {
      product.productId = `SAR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 100)}`;
    }

    // Call Repository mutation (writes to Google Sheets Apps Script)
    const result = await repository.saveOrUpdateProduct(product);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to create product.' }, { status: 500 });
    }

    // Clear catalogue cache automatically
    await repository.clearCatalogueCache();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully in Google Sheets catalogue.',
      productId: product.productId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
