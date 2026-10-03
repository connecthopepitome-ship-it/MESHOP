import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';
import { ProductStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, status } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
    }

    const validStatuses: ProductStatus[] = ['Draft', 'Active', 'Out of Stock', 'Hidden', 'Discontinued'];
    if (!status || !validStatuses.includes(status as ProductStatus)) {
      return NextResponse.json({ success: false, error: 'Valid Status is required.' }, { status: 400 });
    }

    const result = await repository.updateProductStatus(productId, status as ProductStatus);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update status.' }, { status: 500 });
    }

    await repository.clearCatalogueCache();

    return NextResponse.json({
      success: true,
      message: `Product status updated to ${status}.`,
      productId,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
