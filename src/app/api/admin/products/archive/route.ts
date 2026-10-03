import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ success: false, error: 'Product ID is required for archiving.' }, { status: 400 });
    }

    const result = await repository.archiveProduct(productId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to archive product.' }, { status: 500 });
    }

    await repository.clearCatalogueCache();

    return NextResponse.json({
      success: true,
      message: 'Product archived successfully (Status = Discontinued).',
      productId,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
