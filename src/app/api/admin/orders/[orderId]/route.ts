import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = OrderService.getOrder(params.orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await req.json();
    const { action, nextStatus, paymentStatus, reference, note, actor, reason } = body;

    if (action === 'update_status' && nextStatus) {
      const result = await OrderService.updateOrderStatus(params.orderId, nextStatus, actor, reason);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === 'update_payment' && paymentStatus) {
      const result = await OrderService.updatePaymentStatus(params.orderId, paymentStatus, reference, actor);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === 'add_note' && note) {
      const result = OrderService.addInternalNote(params.orderId, note, actor || 'Admin Staff');
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    return NextResponse.json({ success: false, error: 'Unknown or missing action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
