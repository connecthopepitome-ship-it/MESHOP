import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/OrderService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, contact } = body;

    if (!orderNumber || !contact) {
      return NextResponse.json(
        { success: false, error: 'Both Order Number and Phone or Email are required for tracking verification.' },
        { status: 400 }
      );
    }

    const order = OrderService.lookupOrderSecurely(orderNumber, contact);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No matching order found for this Order Number and contact credential.' },
        { status: 404 }
      );
    }

    const tracking = await OrderService.getTracking(order.orderNumber);

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items,
        total: order.total,
        shippingAddress: order.shippingAddress,
        shipment: order.shipment,
        events: order.events,
      },
      tracking,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
