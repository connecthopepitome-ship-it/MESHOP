'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Order, Shipment } from '@/types/orders';
import { OrderService } from '@/lib/services/OrderService';
import {
  Truck,
  ExternalLink,
  Search,
  RefreshCw,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadShipments = () => {
    setLoading(true);
    const res = OrderService.getOrders({ limit: 100 });
    // Filter to only orders that have a shipment recorded
    setOrders(res.orders.filter(o => o.shipment));
    setLoading(false);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (!o.shipment) return false;
    if (carrierFilter !== 'ALL' && o.shipment.carrier !== carrierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.shipment.awbNumber.toLowerCase().includes(q) ||
        o.shipment.carrier.toLowerCase().includes(q)
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
              <Truck className="w-6 h-6 text-terracotta" />
              <span>Shipments & Courier Operations</span>
            </h1>
            <p className="text-xs font-sans text-brand-muted mt-1.5">
              Real-time monitoring of all dispatched parcels, active AWB credentials and carrier transit statuses.
            </p>
          </div>

          <button
            onClick={loadShipments}
            className="flex items-center space-x-1.5 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-4 py-2 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="sorayva-glass-card p-4 rounded-xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, AWB, Carrier or Customer..."
              className="w-full h-10 pl-9 pr-4 text-xs font-sans bg-white/70 border border-brand-border rounded-lg focus:outline-none focus:border-terracotta text-deep-espresso placeholder:text-brand-muted/50"
            />
            <Search className="w-4 h-4 text-brand-muted/60 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="h-10 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">All Carriers</option>
              <option value="Blue Dart Express">Blue Dart Express</option>
              <option value="Delhivery">Delhivery</option>
              <option value="DTDC Courier">DTDC Courier</option>
              <option value="Speed Post (India Post)">Speed Post</option>
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="sorayva-glass-card rounded-xl border border-brand-border overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/60 bg-warm-ivory/50 text-[10px] uppercase font-sans font-semibold tracking-wider text-brand-muted">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Courier Partner</th>
                <th className="py-3.5 px-4">AWB / Tracking Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Dispatch Date</th>
                <th className="py-3.5 px-4">Est. Delivery</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-terracotta mb-2" />
                    <span>Loading shipments...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted">
                    <Package className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
                    <p className="font-serif-display text-base text-deep-espresso">No active shipments found.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const s = order.shipment!;
                  return (
                    <tr key={order.orderId} className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-deep-espresso">
                        <Link href={`/admin/orders/${order.orderId}`} className="hover:text-terracotta">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-deep-espresso">
                        {s.carrier}
                        <div className="text-[10px] text-brand-muted">{s.shippingService}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-terracotta font-semibold">{s.awbNumber}</span>
                        {s.trackingUrl && (
                          <a
                            href={s.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[10px] text-brand-muted hover:text-terracotta underline mt-0.5"
                          >
                            Carrier Portal
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-deep-espresso">{order.customerName}</div>
                        <div className="text-[11px] text-brand-muted">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        {s.dispatchDate ? new Date(s.dispatchDate).toLocaleDateString('en-IN') : 'Staged'}
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString('en-IN') : 'Pending'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : s.status === 'DISPATCHED' || s.status === 'IN_TRANSIT'
                            ? 'bg-blue-50 text-blue-800 border border-blue-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.orderId}`}
                          className="inline-flex items-center space-x-1 bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-terracotta" />
                          <span>View Order</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
