import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyFirebaseIdToken } from '@/lib/auth/serverAuth';
import { OrderService } from '@/lib/services/OrderService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/orders
 * Returns orders strictly associated with the authenticated customer.
 * Uses the verified email claim from the Firebase ID token.
 */
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));
  const verification = await verifyFirebaseIdToken(token);

  if (!verification.valid || !verification.customer) {
    return NextResponse.json(
      { success: false, error: verification.error || 'Unauthorized' },
      { status: verification.status || 401 }
    );
  }

  const { email } = verification.customer;

  if (!email) {
    return NextResponse.json(
      { success: false, error: 'Verified email claim missing from token.' },
      { status: 400 }
    );
  }

  // Fetch only orders strictly matching customer email
  const customerOrders = await OrderService.getCustomerOrders(email);

  return NextResponse.json({
    success: true,
    orders: customerOrders,
    count: customerOrders.length,
  });
}
