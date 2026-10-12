import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await req.json();
    const { checklist, markAsPacked, actor } = body;

    const result = await OrderService.updatePackingChecklist(
      params.orderId,
      checklist || {},
      Boolean(markAsPacked),
      actor || 'Admin Staff'
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
