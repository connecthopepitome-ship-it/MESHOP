import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';

export async function GET(req: NextRequest) {
  try {
    const products = await repository.getAdminProducts();
    
    console.log('--------------------------------------------------');
    console.log('[SERVER ADMIN API GET /api/admin/products]');
    console.log('HTTP Status: 200 OK');
    console.log('Success: true');
    console.log('Product Count:', products.length);
    if (products.length > 0) {
      console.log('First Product ID:', products[0].productId);
    }
    console.log('--------------------------------------------------');

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[SERVER ADMIN API GET /api/admin/products ERROR]:', err);
    return NextResponse.json({
      success: false,
      error: `Failed to fetch admin products: ${err.message}`
    }, { status: 502 });
  }
}
