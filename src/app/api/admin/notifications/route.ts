import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notificationService';
import { emailProvider } from '@/lib/services/emailProvider';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || undefined;

    const notifications = NotificationService.getNotifications(orderId);
    const isConfigured = emailProvider.isConfigured();
    const providerName = emailProvider.getProviderName();

    return NextResponse.json({
      success: true,
      notifications,
      provider: {
        configured: isConfigured,
        name: providerName,
        statusNotice: isConfigured
          ? `Live delivery active via ${providerName}`
          : 'Email provider not configured. Live sending paused; test preview available.',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, notificationId, testRecipient, templateId } = body;

    if (action === 'retry' && notificationId) {
      const result = await NotificationService.retryNotification(notificationId);
      return NextResponse.json(result);
    }

    if (action === 'send_test' && testRecipient && templateId) {
      const result = await NotificationService.sendTestEmail(testRecipient, templateId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid notification action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
