import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await req.json();
    const { action, shipment, trackingEvent, actor } = body;

    if (action === 'create_or_update_shipment' && shipment) {
      const result = await OrderService.createOrUpdateShipment(
        params.orderId,
        shipment,
        actor || 'Admin Staff'
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === 'add_tracking_event' && trackingEvent) {
      const result = await OrderService.recordTrackingEvent(params.orderId, {
        ...trackingEvent,
        actor: actor || 'Logistics Admin',
      });
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
