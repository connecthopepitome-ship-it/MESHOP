import { NextRequest, NextResponse } from 'next/server';
import { ShipmentService } from '@/lib/services/shipmentService';

export async function GET() {
  try {
    const settings = ShipmentService.getShippingSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = ShipmentService.saveShippingSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
