'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Order, OrderStatus, PaymentStatus, OrderEventType, NotificationRecord } from '@/types/orders';
import { formatPrice } from '@/lib/utils';
import { OrderService } from '@/lib/services/OrderService';
import { NotificationService } from '@/lib/services/notificationService';
import { ShipmentService } from '@/lib/services/shipmentService';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  Send,
  Printer,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
  FileText,
  User,
  Phone,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react';

export default function OrderDetailsWorkspace() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Shipment Modal State
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentCarrier, setShipmentCarrier] = useState('Blue Dart Express');
  const [shipmentService, setShipmentService] = useState('Apex Air');
  const [shipmentAwb, setShipmentAwb] = useState('');
  const [shipmentWeight, setShipmentWeight] = useState('1.2 kg');
  const [shipmentDimensions, setShipmentDimensions] = useState('38 x 28 x 8 cm');
  const [shipmentEstDelivery, setShipmentEstDelivery] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');

  // Manual Tracking Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('In Transit Hub Scan');
  const [eventType, setEventType] = useState<OrderEventType>('IN_TRANSIT');
  const [eventDesc, setEventDesc] = useState('Consignment sorted at regional facility.');
  const [eventLocation, setEventLocation] = useState('New Delhi Distribution Centre');

  // Internal Note State
  const [noteInput, setNoteInput] = useState('');

  // Preview Email Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');

  const loadData = useCallback(() => {
    if (!orderId) return;
    const found = OrderService.getOrder(orderId);
    if (found) {
      setOrder({ ...found });
      if (found.shipment) {
        setShipmentCarrier(found.shipment.carrier || 'Blue Dart Express');
        setShipmentService(found.shipment.shippingService || 'Apex Air');
        setShipmentAwb(found.shipment.awbNumber || '');
        setShipmentWeight(found.shipment.weight || '1.2 kg');
        setShipmentDimensions(found.shipment.dimensions || '38 x 28 x 8 cm');
        setShipmentEstDelivery(found.shipment.estimatedDelivery || '');
        setShipmentNotes(found.shipment.fulfilmentNotes || '');
      }
      const notifs = NotificationService.getNotifications(found.orderId);
      setNotifications(notifs);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Status Update Handler
  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await OrderService.updateOrderStatus(order.orderId, nextStatus, 'Staff Member');
      if (res.success && res.order) {
        setOrder({ ...res.order });
        showToast(`Status successfully updated to ${nextStatus}.`);
        loadData();
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Packing Checklist Toggle
  const handleChecklistToggle = async (key: keyof Order['packingChecklist']) => {
    if (!order) return;
    const updated = {
      ...order.packingChecklist,
      [key]: !order.packingChecklist[key],
    };
    const res = await OrderService.updatePackingChecklist(order.orderId, updated, false);
    if (res.success && res.order) {
      setOrder({ ...res.order });
    }
  };

  // Mark as Packed
  const handleMarkAsPacked = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await OrderService.updatePackingChecklist(order.orderId, {}, true, 'Artisan Supervisor');
      if (res.success && res.order) {
        setOrder({ ...res.order });
        showToast('All checks verified. Order marked as PACKED and staged for dispatch.');
        loadData();
      } else {
        alert(res.error || 'Checklist incomplete. Verify all 5 points or supply override.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save Shipment & Dispatch
  const handleSaveShipment = async (dispatchNow: boolean = false) => {
    if (!order) return;
    if (!shipmentCarrier || !shipmentAwb) {
      alert('Please provide both Carrier and AWB tracking number.');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await OrderService.createOrUpdateShipment(
        order.orderId,
        {
          carrier: shipmentCarrier,
          shippingService: shipmentService,
          awbNumber: shipmentAwb,
          weight: shipmentWeight,
          dimensions: shipmentDimensions,
          estimatedDelivery: shipmentEstDelivery,
          fulfilmentNotes: shipmentNotes,
          dispatchNow,
        },
        'Logistics Supervisor'
      );
      if (res.success && res.order) {
        setOrder({ ...res.order });
        setShowShipmentModal(false);
        showToast(dispatchNow ? 'Shipment dispatched with courier credentials and notification queued!' : 'Shipment details saved.');
        loadData();
      } else {
        alert(res.error || 'Failed to save shipment.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Manual Tracking Event
  const handleAddTrackingEvent = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await OrderService.recordTrackingEvent(order.orderId, {
        eventType,
        title: eventTitle,
        description: eventDesc,
        location: eventLocation,
      });
      if (res.success && res.order) {
        setOrder({ ...res.order });
        setShowEventModal(false);
        showToast('Tracking event successfully recorded to shipment timeline.');
        loadData();
      } else {
        alert(res.error || 'Failed to record tracking event.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add Internal Note
  const handleAddNote = () => {
    if (!order || !noteInput.trim()) return;
    const res = OrderService.addInternalNote(order.orderId, noteInput.trim(), 'Admin Concierge');
    if (res.success && res.order) {
      setOrder({ ...res.order });
      setNoteInput('');
      showToast('Internal note appended.');
    }
  };

  // Retry Notification
  const handleRetryNotification = async (notifId: string) => {
    const res = await NotificationService.retryNotification(notifId);
    if (res.success) {
      showToast('Notification retry successful.');
    } else {
      showToast(res.error || 'Notification retry recorded.');
    }
    loadData();
  };

  // Open Preview Modal
  const handlePreviewNotification = (notif: NotificationRecord) => {
    if (!order) return;
    const preview = NotificationService.renderTemplatePreview(notif.eventType, order, order.shipment);
    setPreviewSubject(preview.subject);
    setPreviewHtml(preview.htmlContent);
    setPreviewModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-terracotta mb-3" />
          <p className="font-serif-display text-lg text-deep-espresso">Loading order workspace...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="py-24 text-center sorayva-glass-card rounded-2xl max-w-lg mx-auto p-8 border border-brand-border">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-serif-display text-deep-espresso">Order Not Found</h2>
          <p className="text-xs text-brand-muted mt-2 mb-6">
            The requested order ID &ldquo;{orderId}&rdquo; does not exist in the SORAYVA system.
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 bg-deep-espresso text-champagne px-5 py-2.5 rounded-lg text-xs font-sans uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders Hub</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-20 animate-fadeIn">
        {/* Toast Alert */}
        {statusMessage && (
          <div className="bg-emerald-900 text-warm-ivory px-4 py-2.5 rounded-lg text-xs font-sans flex items-center justify-between shadow-md border border-emerald-700 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-champagne" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-warm-ivory/80 hover:text-white">×</button>
          </div>
        )}

        {/* Workspace Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl border border-brand-border shadow-subtle">
          <div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/orders"
                className="p-1.5 rounded-lg bg-white/70 hover:bg-white text-brand-muted hover:text-deep-espresso border border-brand-border transition-colors"
                title="Back to Orders List"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                <span>Order #{order.orderNumber}</span>
              </h1>
              <span className="text-xs font-mono text-brand-muted">({order.orderId})</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted mt-2">
              <span>Placed: {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span>Client: <strong>{order.customerName}</strong></span>
              <span>•</span>
              <span className="font-semibold text-deep-espresso">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/track-order?id=${order.orderNumber}`}
              target="_blank"
              className="flex items-center space-x-1.5 bg-white/70 hover:bg-white text-deep-espresso border border-brand-border px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
              title="Open customer tracking view"
            >
              <ExternalLink className="w-3.5 h-3.5 text-terracotta" />
              <span>Customer Tracking View</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 bg-white/70 hover:bg-white text-deep-espresso border border-brand-border px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-brand-muted" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========================================================================= */}
          {/* MAIN COLUMN (2/3 width on desktop) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Items Ordered */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <Package className="w-4 h-4 text-terracotta" />
                  <span>Items Ordered ({order.items.length})</span>
                </h2>
                <span className="text-xs text-brand-muted">
                  Total items: {order.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>

              <div className="divide-y divide-brand-border/40">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-4">
                    <div className="w-16 h-20 bg-warm-ivory rounded border border-brand-border overflow-hidden relative flex-shrink-0">
                      {item.mainImage ? (
                        <Image
                          src={item.mainImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted/40 text-[10px]">No Pic</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-serif-display font-medium text-deep-espresso leading-snug">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 text-[11px] text-brand-muted mt-1">
                        <span>SKU: <strong className="font-mono text-deep-espresso">{item.sku}</strong></span>
                        {item.selectedBlouseSize && <span>Blouse Size: <strong className="text-terracotta">{item.selectedBlouseSize}</strong></span>}
                        <span>Qty: <strong>{item.quantity}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-deep-espresso block">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <span className="text-[10px] text-brand-muted">
                        ({formatPrice(item.price)} each)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Customer & Delivery Address */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-terracotta" />
                  <span>Delivery & Customer Details</span>
                </h2>
                <span className="text-xs text-brand-muted flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Verified Address
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40">
                  <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider block">Customer Contact</span>
                  <div className="font-medium text-deep-espresso">{order.customerName}</div>
                  <div className="text-brand-muted">{order.email}</div>
                  <div className="text-brand-muted">{order.phone}</div>
                </div>

                <div className="space-y-1.5 p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40">
                  <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider block">Shipping Destination</span>
                  <div className="font-medium text-deep-espresso">{order.shippingAddress.fullName}</div>
                  <div className="text-brand-muted leading-relaxed">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Dedicated Fulfilment & Packing Checklist */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <div>
                  <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-terracotta" />
                    <span>Fulfilment & Packing Checklist</span>
                  </h2>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Physical saree inspection must be validated before marking package packed.
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  order.orderStatus === 'PACKED' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {order.orderStatus === 'PACKED' ? 'Packed' : order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'Fulfilled' : 'In Progress'}
                </span>
              </div>

              {/* 5 Quality Checkpoints */}
              <div className="space-y-2.5">
                {[
                  { key: 'productColorVerified', label: 'Verify saree design, colour accuracy and pallu pattern match' },
                  { key: 'quantityVerified', label: 'Verify ordered item quantity and correct unstitched/stitched blouse size' },
                  { key: 'qualityInspectionPassed', label: 'Artisan quality inspection (zari integrity, selvage hems, zero defects)' },
                  { key: 'packagingCompleted', label: 'Wrapped in breathable mulberry tissue & placed in luxury keepsake box' },
                  { key: 'shippingLabelAttached', label: 'Security seal attached and courier barcode shipping label affixed' },
                ].map((chk) => {
                  const isChecked = Boolean(order.packingChecklist[chk.key as keyof typeof order.packingChecklist]);
                  return (
                    <label
                      key={chk.key}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 border border-brand-border/40 hover:bg-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleChecklistToggle(chk.key as any)}
                        className="mt-0.5 w-4 h-4 text-terracotta rounded border-brand-border focus:ring-terracotta cursor-pointer"
                      />
                      <span className={`text-xs ${isChecked ? 'text-deep-espresso font-medium line-through opacity-70' : 'text-deep-espresso'}`}>
                        {chk.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Inspector Signature and Action Button */}
              <div className="pt-3 border-t border-brand-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-brand-muted">
                  {order.packingChecklist.packedBy ? (
                    <span>Packed by <strong>{order.packingChecklist.packedBy}</strong> on {new Date(order.packingChecklist.packedAt!).toLocaleDateString('en-IN')}</span>
                  ) : (
                    <span>Awaiting staff packing sign-off.</span>
                  )}
                </div>

                {order.orderStatus === 'PROCESSING' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PLACED' ? (
                  <button
                    onClick={handleMarkAsPacked}
                    disabled={isUpdating}
                    className="bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-4 py-2 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Mark as Packed
                  </button>
                ) : null}
              </div>
            </div>

            {/* 4. Shipment Details & Courier Dispatch */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <div>
                  <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-terracotta" />
                    <span>Shipment & Logistics</span>
                  </h2>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Carrier partner credentials and AWB tracking records.
                  </p>
                </div>

                <button
                  onClick={() => setShowShipmentModal(true)}
                  className="bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
                >
                  {order.shipment ? 'Edit Shipment' : 'Create Shipment'}
                </button>
              </div>

              {order.shipment ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40">
                    <span className="text-[10px] text-brand-muted uppercase tracking-wider block font-semibold">Courier Partner</span>
                    <strong className="text-deep-espresso font-medium">{order.shipment.carrier}</strong>
                    <div className="text-[11px] text-brand-muted">{order.shipment.shippingService}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40">
                    <span className="text-[10px] text-brand-muted uppercase tracking-wider block font-semibold">AWB / Tracking #</span>
                    <strong className="font-mono text-terracotta block">{order.shipment.awbNumber}</strong>
                    {order.shipment.trackingUrl && (
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-terracotta hover:underline inline-flex items-center mt-1"
                      >
                        <span>Direct Carrier Link</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40">
                    <span className="text-[10px] text-brand-muted uppercase tracking-wider block font-semibold">Parcel Specifications</span>
                    <div className="text-deep-espresso">{order.shipment.weight} • {order.shipment.dimensions}</div>
                    <div className="text-[11px] text-brand-muted">{order.shipment.parcelsCount || 1} parcel(s)</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-warm-ivory/40 border border-dashed border-brand-border text-center text-xs text-brand-muted">
                  No shipment has been generated yet for this order. Click &ldquo;Create Shipment&rdquo; to input carrier details and AWB.
                </div>
              )}
            </div>

            {/* 5. Shipment Chronological Event Timeline */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-terracotta" />
                  <span>Shipment Event Timeline</span>
                </h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1 text-terracotta" />
                  <span>Add Event</span>
                </button>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border/60">
                {order.events && order.events.length > 0 ? (
                  order.events.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-terracotta ring-4 ring-white" />
                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-deep-espresso">{evt.title}</strong>
                          <span className="text-[10px] text-brand-muted">
                            {new Date(evt.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-brand-muted text-[11px] mt-0.5">{evt.description}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-brand-muted/70 mt-1">
                          <span className="uppercase tracking-wider">Source: {evt.source}</span>
                          {evt.actor && <span>• Actor: {evt.actor}</span>}
                          {evt.location && <span>• {evt.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted">No timeline events recorded.</p>
                )}
              </div>
            </div>

            {/* 6. Internal Staff Notes Thread */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h2 className="text-base font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-terracotta" />
                  <span>Internal Operational Notes</span>
                </h2>
                <span className="text-[10px] text-brand-muted uppercase tracking-wider bg-brand-surface px-2 py-0.5 rounded">
                  Staff Confidential Only
                </span>
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add confidential customer note, alteration request, packaging instruction..."
                  className="flex-1 h-9 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg focus:outline-none focus:border-terracotta text-deep-espresso"
                />
                <button
                  onClick={handleAddNote}
                  className="bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-4 py-2 rounded-lg text-xs font-sans font-medium transition-colors"
                >
                  Save Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-2 pt-2">
                {order.internalNotes && order.internalNotes.length > 0 ? (
                  order.internalNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/30 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-brand-muted mb-1">
                        <strong>{note.author}</strong>
                        <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-deep-espresso">{note.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted/70 italic">No internal notes added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SIDE COLUMN (1/3 width on desktop) */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {/* Status & Next Action Card */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider block">
                  Current Lifecycle State
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-serif-display font-bold text-deep-espresso">
                    {order.orderStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-terracotta/10 text-terracotta border border-terracotta/30">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Primary Next Action Smart Button */}
              <div className="pt-3 border-t border-brand-border/40 space-y-2">
                <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider block">
                  Suggested Next Action
                </span>

                {order.orderStatus === 'PLACED' && (
                  <button
                    onClick={() => handleStatusChange('CONFIRMED')}
                    disabled={isUpdating}
                    className="w-full bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Confirm Order
                  </button>
                )}

                {order.orderStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange('PROCESSING')}
                    disabled={isUpdating}
                    className="w-full bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Allocate & Begin Preparing
                  </button>
                )}

                {order.orderStatus === 'PROCESSING' && (
                  <button
                    onClick={handleMarkAsPacked}
                    disabled={isUpdating}
                    className="w-full bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Sign Off & Mark Packed
                  </button>
                )}

                {order.orderStatus === 'PACKED' && (
                  <button
                    onClick={() => setShowShipmentModal(true)}
                    disabled={isUpdating}
                    className="w-full bg-terracotta hover:bg-deep-espresso text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Assign Carrier & Dispatch
                  </button>
                )}

                {order.orderStatus === 'SHIPPED' && (
                  <button
                    onClick={() => handleStatusChange('OUT_FOR_DELIVERY')}
                    disabled={isUpdating}
                    className="w-full bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Mark Out For Delivery
                  </button>
                )}

                {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleStatusChange('DELIVERED')}
                    disabled={isUpdating}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-3 rounded-lg text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Confirm Delivered
                  </button>
                )}

                {order.orderStatus === 'DELIVERED' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-xs text-emerald-800 font-medium flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Fulfilment Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Amount Summary */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-3">
              <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider block border-b border-brand-border/40 pb-2">
                Order Financials
              </span>

              <div className="space-y-1.5 text-xs text-brand-muted">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-deep-espresso font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-terracotta">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-deep-espresso font-medium">
                    {order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="border-t border-brand-border/40 pt-2 mt-2 flex justify-between text-sm font-bold text-deep-espresso">
                  <span>Total Amount:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="text-[11px] text-brand-muted/80 bg-warm-ivory/60 p-2.5 rounded border border-brand-border/30 mt-3">
                <span>Mode: <strong className="uppercase">{order.paymentMethod}</strong></span><br />
                {order.paymentReference && <span>Ref: <code className="font-mono text-terracotta">{order.paymentReference}</code></span>}
              </div>
            </div>

            {/* Email Notification Outbox History */}
            <div className="sorayva-glass-card rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <h3 className="text-sm font-serif-display font-medium text-deep-espresso flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-terracotta" />
                  <span>Notification Outbox ({notifications.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.notificationId}
                      className="p-3 rounded-lg bg-warm-ivory/50 border border-brand-border/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-deep-espresso">{n.eventType}</strong>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          n.deliveryStatus === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : n.deliveryStatus === 'QUEUED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {n.deliveryStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-muted truncate" title={n.subject}>
                        {n.subject}
                      </div>
                      {n.errorDetails && (
                        <p className="text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded">
                          {n.errorDetails}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-brand-border/20 text-[10px]">
                        <span className="text-brand-muted/70">{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => handlePreviewNotification(n)}
                            className="text-terracotta hover:underline font-medium"
                          >
                            Preview
                          </button>
                          {n.deliveryStatus === 'FAILED' && (
                            <button
                              onClick={() => handleRetryNotification(n.notificationId)}
                              className="text-deep-espresso hover:underline font-semibold"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-muted/70 italic">No notifications generated yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SHIPMENT MODAL */}
        {/* ========================================================================= */}
        {showShipmentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="sorayva-glass-card max-w-lg w-full p-6 rounded-2xl border border-brand-border shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h3 className="text-lg font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-terracotta" />
                  <span>Shipment & Dispatch Details</span>
                </h3>
                <button onClick={() => setShowShipmentModal(false)} className="text-brand-muted hover:text-deep-espresso">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Carrier Partner</label>
                  <select
                    value={shipmentCarrier}
                    onChange={(e) => setShipmentCarrier(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  >
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="Speed Post (India Post)">Speed Post (India Post)</option>
                    <option value="Shiprocket">Shiprocket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">AWB / Tracking Number (Required)</label>
                  <input
                    type="text"
                    value={shipmentAwb}
                    onChange={(e) => setShipmentAwb(e.target.value)}
                    placeholder="e.g. BD-892138402"
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso font-mono focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Service Type</label>
                    <input
                      type="text"
                      value={shipmentService}
                      onChange={(e) => setShipmentService(e.target.value)}
                      placeholder="e.g. Apex Air"
                      className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Estimated Delivery</label>
                    <input
                      type="date"
                      value={shipmentEstDelivery ? shipmentEstDelivery.slice(0, 10) : ''}
                      onChange={(e) => setShipmentEstDelivery(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Package Weight</label>
                    <input
                      type="text"
                      value={shipmentWeight}
                      onChange={(e) => setShipmentWeight(e.target.value)}
                      placeholder="e.g. 1.2 kg"
                      className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Dimensions</label>
                    <input
                      type="text"
                      value={shipmentDimensions}
                      onChange={(e) => setShipmentDimensions(e.target.value)}
                      placeholder="e.g. 38 x 28 x 8 cm"
                      className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Fulfilment Notes</label>
                  <textarea
                    rows={2}
                    value={shipmentNotes}
                    onChange={(e) => setShipmentNotes(e.target.value)}
                    placeholder="Instructions for courier or delivery agent..."
                    className="w-full p-2.5 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border/40 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-sans text-brand-muted hover:text-deep-espresso"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveShipment(false)}
                  className="px-4 py-2 bg-white border border-brand-border rounded-lg text-xs font-sans font-medium text-deep-espresso hover:bg-brand-surface"
                >
                  Save Details Only
                </button>
                <button
                  onClick={() => handleSaveShipment(true)}
                  className="px-4 py-2 bg-deep-espresso text-champagne hover:bg-terracotta hover:text-white rounded-lg text-xs font-sans font-medium uppercase tracking-wider"
                >
                  Save & Dispatch Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MANUAL TRACKING EVENT MODAL */}
        {/* ========================================================================= */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="sorayva-glass-card max-w-md w-full p-6 rounded-2xl border border-brand-border shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                <h3 className="text-lg font-serif-display font-medium text-deep-espresso flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-terracotta" />
                  <span>Record Tracking Event</span>
                </h3>
                <button onClick={() => setShowEventModal(false)} className="text-brand-muted hover:text-deep-espresso">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  >
                    <option value="IN_TRANSIT">In Transit Scan</option>
                    <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="DELIVERY_EXCEPTION">Delivery Exception / Delay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Location</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Regional Hub - Mumbai"
                    className="w-full h-9 px-3 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-brand-muted mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full p-2.5 bg-white border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border/40 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-lg text-xs font-sans text-brand-muted hover:text-deep-espresso"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrackingEvent}
                  className="px-4 py-2 bg-deep-espresso text-champagne hover:bg-terracotta hover:text-white rounded-lg text-xs font-sans font-medium uppercase tracking-wider"
                >
                  Record Event
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </AdminLayout>
  );
}
