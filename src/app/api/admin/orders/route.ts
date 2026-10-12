import { NextRequest, NextResponse } from 'next/server';
import { OrderService, OrderFilterParams } from '@/lib/services/OrderService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: OrderFilterParams = {
      searchQuery: searchParams.get('q') || undefined,
      orderStatus: (searchParams.get('status') as any) || 'ALL',
      paymentStatus: (searchParams.get('payment') as any) || 'ALL',
      courierPartner: searchParams.get('courier') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'date_desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
    };

    const data = OrderService.getOrders(params);

    return NextResponse.json({
      success: true,
      orders: data.orders,
      totalCount: data.totalCount,
      counts: data.counts,
    });
  } catch (err: any) {
    console.error('[API GET /api/admin/orders ERROR]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.email || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields (customerName, email, items)' },
        { status: 400 }
      );
    }

    const result = await OrderService.createOrder(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API POST /api/admin/orders ERROR]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
