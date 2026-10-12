'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { NotificationPreferences, OrderEventType } from '@/types/orders';
import { NotificationService } from '@/lib/services/notificationService';
import { OrderService } from '@/lib/services/OrderService';
import {
  Mail,
  Save,
  CheckCircle2,
  Sliders,
  Eye,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(NotificationService.getPreferences());
  const [savedMsg, setSavedMsg] = useState(false);

  // Template Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    setPrefs(NotificationService.getPreferences());
  }, []);

  const handleSave = () => {
    const updated = NotificationService.savePreferences(prefs);
    setPrefs(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handlePreviewTemplate = (eventType: OrderEventType) => {
    const sampleOrder = OrderService.getOrders({ limit: 1 }).orders[0];
    if (sampleOrder) {
      const p = NotificationService.renderTemplatePreview(eventType, sampleOrder, sampleOrder.shipment);
      setPreviewSubject(p.subject);
      setPreviewHtml(p.htmlContent);
      setPreviewOpen(true);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-5xl mx-auto animate-fadeIn">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-brand-border/60 pb-3">
          <Link
            href="/admin/settings/shipping"
            className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-brand-muted hover:text-deep-espresso hover:bg-white/40 transition-colors"
          >
            Shipping & Courier Setup
          </Link>
          <Link
            href="/admin/settings/notifications"
            className="px-4 py-2 rounded-lg text-xs font-sans font-semibold bg-deep-espresso text-warm-ivory shadow-sm"
          >
            Notification Preferences
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl border border-brand-border shadow-subtle">
          <div>
            <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-2.5">
              <Mail className="w-6 h-6 text-terracotta" />
              <span>Transactional Notification Settings</span>
            </h1>
            <p className="text-xs font-sans text-brand-muted mt-1.5">
              Configure event-to-notification triggers, sender branding identity and transactional email controls.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-5 py-2.5 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Notification preferences successfully saved and applied to event engine.</span>
          </div>
        )}

        {/* Sender Identity */}
        <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
          <h2 className="text-base font-serif-display font-medium text-deep-espresso border-b border-brand-border/40 pb-2">
            Sender & Concierge Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={prefs.senderName}
                onChange={(e) => setPrefs({ ...prefs, senderName: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                From Email Address
              </label>
              <input
                type="email"
                value={prefs.senderEmail}
                onChange={(e) => setPrefs({ ...prefs, senderEmail: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                Support / Concierge Email
              </label>
              <input
                type="email"
                value={prefs.supportEmail}
                onChange={(e) => setPrefs({ ...prefs, supportEmail: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Event Triggers List */}
        <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border/40 pb-3">
            <h2 className="text-base font-serif-display font-medium text-deep-espresso">
              Automated Email Event Triggers
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Enable or silence specific transactional email notifications sent to customers upon order state transitions.
            </p>
          </div>

          <div className="divide-y divide-brand-border/30">
            {[
              {
                key: 'notifyOrderPlaced',
                event: 'ORDER_PLACED' as OrderEventType,
                title: 'Order Placed (Received)',
                desc: 'Sent immediately when customer finishes checkout. Includes items summary and payment status.',
              },
              {
                key: 'notifyPaymentConfirmed',
                event: 'PAYMENT_CONFIRMED' as OrderEventType,
                title: 'Payment Confirmed',
                desc: 'Sent when payment gateway confirms successful capture. Includes gateway transaction reference.',
              },
              {
                key: 'notifyOrderPacked',
                event: 'ORDER_PACKED' as OrderEventType,
                title: 'Order Packed (Atelier Quality Passed)',
                desc: 'Sent after 5-point physical quality checks pass. Informs customer parcel is keepsake boxed.',
              },
              {
                key: 'notifyShipmentDispatched',
                event: 'SHIPMENT_DISPATCHED' as OrderEventType,
                title: 'Order Dispatched (High Priority)',
                desc: 'Sent when shipment state transitions to SHIPPED. Includes courier partner, AWB number and live tracking link.',
              },
              {
                key: 'notifyOutForDelivery',
                event: 'OUT_FOR_DELIVERY' as OrderEventType,
                title: 'Out For Delivery',
                desc: 'Sent on the morning of delivery when delivery vehicle departs local courier facility.',
              },
              {
                key: 'notifyDelivered',
                event: 'DELIVERED' as OrderEventType,
                title: 'Order Delivered',
                desc: 'Sent when delivery partner confirms handover to recipient at delivery address.',
              },
              {
                key: 'notifyCancelled',
                event: 'ORDER_CANCELLED' as OrderEventType,
                title: 'Order Cancelled',
                desc: 'Sent upon order cancellation with reason and refund turnaround notice.',
              },
            ].map((item) => {
              const isEnabled = Boolean(prefs[item.key as keyof NotificationPreferences]);
              return (
                <div key={item.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <strong className="text-sm font-serif-display text-deep-espresso block">{item.title}</strong>
                    <p className="text-xs text-brand-muted">{item.desc}</p>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handlePreviewTemplate(item.event)}
                      className="inline-flex items-center space-x-1 text-xs text-terracotta hover:underline font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview HTML</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(item.key as any)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-deep-espresso' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full h-[85vh] rounded-2xl border border-brand-border shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
              <div className="p-4 bg-warm-ivory border-b border-brand-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-terracotta">Live Template Preview</span>
                  <h3 className="text-sm font-medium text-deep-espresso">{previewSubject}</h3>
                </div>
                <button onClick={() => setPreviewOpen(false)} className="text-brand-muted hover:text-deep-espresso text-lg font-bold">×</button>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <iframe
                  title="Template Preview"
                  srcDoc={previewHtml}
                  className="w-full h-full border border-gray-200 rounded shadow-sm bg-white"
                />
              </div>

              <div className="p-3 bg-warm-ivory border-t border-brand-border text-right">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="bg-deep-espresso text-champagne px-5 py-2 rounded-lg text-xs font-sans uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
