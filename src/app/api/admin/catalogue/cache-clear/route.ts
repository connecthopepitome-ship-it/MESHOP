import { NextResponse } from 'next/server';
import { repository } from '@/lib/api/googleSheetsRepository';

export async function POST() {
  try {
    const success = await repository.clearCatalogueCache();
    return NextResponse.json({
      success,
      message: 'Published catalogue cache cleared successfully.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
