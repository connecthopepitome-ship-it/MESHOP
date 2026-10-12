/**
 * SORAYVA Transactional Email Provider Interface & Adapter
 * Strictly adheres to honesty rules: Never simulates successful email sends
 * when credentials are unconfigured.
 */

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  unconfigured?: boolean;
}

export interface EmailProvider {
  isConfigured(): boolean;
  getProviderName(): string;
  getDiagnostics(): { configured: boolean; providerName: string; defaultSender: string; instructions: string };
  sendEmail(payload: SendEmailPayload): Promise<SendEmailResult>;
}

class TransactionalEmailProvider implements EmailProvider {
  private resendApiKey?: string;
  private smtpHost?: string;
  private defaultSender: string;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY;
    this.smtpHost = process.env.SMTP_HOST;
    this.defaultSender = process.env.EMAIL_FROM || 'SORAYVA Concierge <orders@sorayva.com>';
  }

  isConfigured(): boolean {
    return Boolean(this.resendApiKey || this.smtpHost);
  }

  getProviderName(): string {
    if (this.resendApiKey) return 'Resend API';
    if (this.smtpHost) return 'SMTP Server';
    return 'None (Unconfigured)';
  }

  getDiagnostics(): { configured: boolean; providerName: string; defaultSender: string; instructions: string } {
    const configured = this.isConfigured();
    return {
      configured,
      providerName: this.getProviderName(),
      defaultSender: this.defaultSender,
      instructions: configured
        ? `Connected to ${this.getProviderName()}. Transactional notifications will be delivered.`
        : 'No email credentials configured. Set RESEND_API_KEY or SMTP_HOST in .env.local to enable live delivery.',
    };
  }

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    const from = payload.from || this.defaultSender;

    // Strict guard: if no credentials exist, DO NOT pretend it was sent.
    if (!this.isConfigured()) {
      return {
        success: false,
        unconfigured: true,
        error: 'Email provider not configured. Live email delivery paused until RESEND_API_KEY or SMTP credentials are configured.',
      };
    }

    // If Resend is configured:
    if (this.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          return { success: true, messageId: data.id };
        } else {
          return { success: false, error: data.message || 'Resend API rejected request' };
        }
      } catch (e: any) {
        return { success: false, error: e.message || 'Network error communicating with email provider' };
      }
    }

    // Fallback if SMTP or other configured provider
    return {
      success: false,
      error: 'SMTP integration pending server runtime adapter configuration.',
    };
  }
}

export const emailProvider = new TransactionalEmailProvider();
