import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyFirebaseIdToken } from '@/lib/auth/serverAuth';
import { CustomerService } from '@/lib/services/CustomerService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/addresses
 * Returns saved addresses for the verified customer.
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

  const { uid } = verification.customer;
  const addresses = await CustomerService.getAddresses(uid);

  return NextResponse.json({
    success: true,
    addresses,
  });
}

/**
 * POST /api/customer/addresses
 * Creates a new address for the verified customer.
 */
export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));
  const verification = await verifyFirebaseIdToken(token);

  if (!verification.valid || !verification.customer) {
    return NextResponse.json(
      { success: false, error: verification.error || 'Unauthorized' },
      { status: verification.status || 401 }
    );
  }

  const { uid } = verification.customer;

  try {
    const body = await req.json();
    const { name, phone, line1, line2, city, state, pincode, country, type, isDefault } = body;

    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing required address fields.' },
        { status: 400 }
      );
    }

    const res = await CustomerService.addAddress(uid, {
      name: name.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: line2?.trim() || '',
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country?.trim() || 'India',
      type: type || 'Home',
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to add address.' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/customer/addresses
 * Updates an address owned by the verified customer.
 */
export async function PUT(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));
  const verification = await verifyFirebaseIdToken(token);

  if (!verification.valid || !verification.customer) {
    return NextResponse.json(
      { success: false, error: verification.error || 'Unauthorized' },
      { status: verification.status || 401 }
    );
  }

  const { uid } = verification.customer;

  try {
    const body = await req.json();
    const { addressId, ...data } = body;

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'addressId is required.' },
        { status: 400 }
      );
    }

    const res = await CustomerService.updateAddress(uid, addressId, data);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update address.' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/customer/addresses?id=<addressId>
 * Deletes an address owned by the verified customer.
 */
export async function DELETE(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'));
  const verification = await verifyFirebaseIdToken(token);

  if (!verification.valid || !verification.customer) {
    return NextResponse.json(
      { success: false, error: verification.error || 'Unauthorized' },
      { status: verification.status || 401 }
    );
  }

  const { uid } = verification.customer;
  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get('id');

  if (!addressId) {
    return NextResponse.json(
      { success: false, error: 'Missing addressId parameter.' },
      { status: 400 }
    );
  }

  const res = await CustomerService.deleteAddress(uid, addressId);
  return NextResponse.json(res);
}
