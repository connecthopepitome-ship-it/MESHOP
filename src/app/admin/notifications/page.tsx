'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { NotificationRecord, OrderEventType } from '@/types/orders';
import { NotificationService } from '@/lib/services/notificationService';
import { emailProvider } from '@/lib/services/emailProvider';
import { OrderService } from '@/lib/services/OrderService';
import {
  Mail,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Search,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [providerName, setProviderName] = useState('Unconfigured');

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QUEUED' | 'SENT' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testTemplate, setTestTemplate] = useState<OrderEventType>('ORDER_PLACED');
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  const loadNotifications = () => {
    setLoading(true);
    const notifs = NotificationService.getNotifications();
    setNotifications(notifs);
    setIsConfigured(emailProvider.isConfigured());
    setProviderName(emailProvider.getProviderName());
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRetry = async (id: string) => {
    const res = await NotificationService.retryNotification(id);
    if (res.success) {
      alert('Notification re-sent successfully!');
    } else {
      alert(`Retry processed: ${res.error || 'Provider rejected request'}`);
    }
    loadNotifications();
  };

  const handlePreview = (record: NotificationRecord) => {
    const order = OrderService.getOrder(record.orderId);
    if (!order) return;
    const preview = NotificationService.renderTemplatePreview(record.eventType, order, order.shipment);
    setPreviewSubject(preview.subject);
    setPreviewHtml(preview.htmlContent);
    setPreviewModalOpen(true);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;
    setTestSubmitting(true);
    setTestResultMsg(null);
    try {
      const res = await NotificationService.sendTestEmail(testRecipient.trim(), testTemplate);
      if (res.success) {
        setTestResultMsg('Test email delivered successfully via provider!');
      } else {
        setTestResultMsg(res.error || 'Live sending paused: provider credentials not configured. Recorded test outbox entry.');
      }
      loadNotifications();
    } catch (e: any) {
      setTestResultMsg(e.message);
    } finally {
      setTestSubmitting(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (statusFilter !== 'ALL' && n.deliveryStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        n.orderNumber.toLowerCase().includes(q) ||
        n.recipient.toLowerCase().includes(q) ||
        n.eventType.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl border border-brand-border shadow-subtle">
          <div>
            <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-2.5">
              <Mail className="w-6 h-6 text-terracotta" />
              <span>Transactional Email Centre</span>
            </h1>
            <p className="text-xs font-sans text-brand-muted mt-1.5">
              Event-driven notification outbox with audit logs, delivery diagnostics and failure recovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTestResultMsg(null);
                setTestModalOpen(true);
              }}
              className="bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5 inline mr-1.5 text-terracotta" />
              <span>Send Test Email</span>
            </button>

            <button
              onClick={loadNotifications}
              className="bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-4 py-2 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Honest Provider Status Banner */}
        <div className={`p-4 rounded-xl border text-xs flex items-start sm:items-center justify-between gap-3 ${
          isConfigured
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          <div className="flex items-start sm:items-center space-x-3">
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <strong className="font-semibold">
                {isConfigured ? `Email Provider Active: ${providerName}` : 'Email Provider Not Configured (Safe Preview Mode)'}
              </strong>
              <p className="text-[11px] mt-0.5 opacity-80">
                {isConfigured
                  ? 'All order events and courier notifications are transmitting directly to live mailboxes.'
                  : 'Live email sending is safely paused. Every transactional trigger is queued in the Outbox below with full branded HTML preview.'}
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings/notifications"
            className="text-[11px] font-semibold underline whitespace-nowrap hover:opacity-80 flex-shrink-0"
          >
            Configure Preferences
          </Link>
        </div>

        {/* Filters */}
        <div className="sorayva-glass-card p-4 rounded-xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Order #, Event, Recipient or Subject..."
              className="w-full h-10 pl-9 pr-4 text-xs font-sans bg-white/70 border border-brand-border rounded-lg focus:outline-none focus:border-terracotta text-deep-espresso placeholder:text-brand-muted/50"
            />
            <Search className="w-4 h-4 text-brand-muted/60 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">Status: All</option>
              <option value="SENT">Sent</option>
              <option value="QUEUED">Queued</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Outbox Table */}
        <div className="sorayva-glass-card rounded-xl border border-brand-border overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/60 bg-warm-ivory/50 text-[10px] uppercase font-sans font-semibold tracking-wider text-brand-muted">
                <th className="py-3.5 px-4">Event Trigger</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Attempts</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-terracotta mb-2" />
                    <span>Loading outbox...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted">
                    <Mail className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
                    <p className="font-serif-display text-base text-deep-espresso">No notifications found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.notificationId} className="hover:bg-white/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-deep-espresso">
                      <span className="font-mono text-xs">{item.eventType}</span>
                      {item.isTest && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                          Test
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Link href={`/admin/orders/${item.orderId}`} className="hover:text-terracotta font-medium">
                        {item.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-muted">
                      {item.recipient}
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted max-w-xs truncate" title={item.subject}>
                      {item.subject}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.deliveryStatus === 'SENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : item.deliveryStatus === 'QUEUED'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}>
                        {item.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-brand-muted">
                      {item.attempts} / {item.maxAttempts}
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handlePreview(item)}
                        className="inline-flex items-center space-x-1 bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-2.5 py-1 rounded text-xs font-sans transition-colors"
                      >
                        <Eye className="w-3 h-3 text-terracotta" />
                        <span>Preview</span>
                      </button>
                      {item.deliveryStatus === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(item.notificationId)}
                          className="inline-flex items-center space-x-1 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-2.5 py-1 rounded text-xs font-sans transition-colors"
                        >
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* EMAIL PREVIEW MODAL */}
        {/* ========================================================================= */}
        {previewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full h-[85vh] rounded-2xl border border-brand-border shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
              <div className="p-4 bg-warm-ivory border-b border-brand-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-terracotta">Transactional Email Preview</span>
                  <h3 className="text-sm font-medium text-deep-espresso">{previewSubject}</h3>
                </div>
                <button onClick={() => setPreviewModalOpen(false)} className="text-brand-muted hover:text-deep-espresso text-lg font-bold">×</button>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <iframe
                  title="Email Preview Frame"
                  srcDoc={previewHtml}
                  className="w-full h-full border border-gray-200 rounded shadow-sm bg-white"
                />
              </div>

              <div className="p-3 bg-warm-ivory border-t border-brand-border text-right">
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="bg-deep-espresso text-champagne px-5 py-2 rounded-lg text-xs font-sans uppercase tracking-wider"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEND TEST EMAIL MODAL */}
        {/* ========================================================================= */}
        {testModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="sorayva-glass-card max-w-md w-full p-6 rounded-2xl border border-brand-border shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h3 className="text-lg font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <Send className="w-5 h-5 text-terracotta" />
                  <span>Send Test Transactional Email</span>
                </h3>
                <button onClick={() => setTestModalOpen(false)} className="text-brand-muted hover:text-deep-espresso">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendTest} className="space-y-3 text-xs">
                {testResultMsg && (
                  <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    {testResultMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                    Template To Test
                  </label>
                  <select
                    value={testTemplate}
                    onChange={(e) => setTestTemplate(e.target.value as any)}
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  >
                    <option value="ORDER_PLACED">Order Placed (Received)</option>
                    <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                    <option value="ORDER_PACKED">Order Packed (Atelier Quality)</option>
                    <option value="SHIPMENT_DISPATCHED">Shipment Dispatched (With AWB)</option>
                    <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="ORDER_CANCELLED">Order Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">
                    Authorized Test Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="e.g. staff@sorayva.com"
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                  <p className="text-[10px] text-brand-muted mt-1">
                    * Clearly marked as a test notification; will never be sent to customers.
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/40 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setTestModalOpen(false)}
                    className="px-4 py-2 border border-brand-border rounded-lg text-xs font-sans text-brand-muted hover:text-deep-espresso"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testSubmitting}
                    className="px-4 py-2 bg-deep-espresso text-champagne hover:bg-terracotta hover:text-white rounded-lg text-xs font-sans font-medium uppercase tracking-wider"
                  >
                    {testSubmitting ? 'Transmitting...' : 'Dispatch Test'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
