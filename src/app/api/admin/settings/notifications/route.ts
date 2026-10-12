import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notificationService';

export async function GET() {
  try {
    const preferences = NotificationService.getPreferences();
    return NextResponse.json({ success: true, preferences });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = NotificationService.savePreferences(body);
    return NextResponse.json({ success: true, preferences: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
