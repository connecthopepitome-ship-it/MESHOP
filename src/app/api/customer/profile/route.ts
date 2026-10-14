import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyFirebaseIdToken } from '@/lib/auth/serverAuth';
import { CustomerService } from '@/lib/services/CustomerService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/profile
 * Returns the profile of the verified customer.
 * UID is derived strictly from the verified Firebase ID Token.
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

  const { uid, email, emailVerified } = verification.customer;
  const profile = (await CustomerService.getProfile(uid)) || {
    customerId: uid,
    uid,
    name: verification.customer.name || email.split('@')[0],
    displayName: verification.customer.name || email.split('@')[0],
    email,
    emailVerified,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    profile,
  });
}

/**
 * PUT /api/customer/profile
 * Updates the profile of the verified customer.
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

  const { uid, email } = verification.customer;

  try {
    const body = await req.json();
    const { name, displayName, phone } = body;

    // Security: Reject client attempts to elevate privileges or modify immutable fields
    if (body.isAdmin || body.role || body.customerId || body.uid) {
      if (body.uid && body.uid !== uid) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Cannot alter UID or ownership.' },
          { status: 403 }
        );
      }
    }

    await CustomerService.updateProfile(uid, {
      name: name?.trim(),
      displayName: (displayName || name)?.trim(),
      phone: phone?.trim(),
      email,
    });

    const updatedProfile = await CustomerService.getProfile(uid);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update profile.' },
      { status: 400 }
    );
  }
}
