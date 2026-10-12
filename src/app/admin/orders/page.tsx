'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Order, OrderStatus, PaymentStatus } from '@/types/orders';
import { formatPrice } from '@/lib/utils';
import { OrderService } from '@/lib/services/OrderService';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Calendar,
  X,
  ArrowUpDown,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    placed: 0,
    awaitingFulfilment: 0,
    readyToDispatch: 0,
    inTransit: 0,
    delivered: 0,
    exceptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedCourier, setSelectedCourier] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'total_desc' | 'total_asc'>('date_desc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      // Fetch via internal service
      const res = OrderService.getOrders({
        searchQuery,
        orderStatus: selectedStatus,
        paymentStatus: selectedPayment,
        courierPartner: selectedCourier,
        sortBy,
      });
      setOrders(res.orders);
      setCounts(res.counts);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedStatus, selectedPayment, selectedCourier, sortBy]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleExportCSV = () => {
    const csvContent = OrderService.exportOrdersCSV(orders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SORAYVA_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200">New Placed</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">Preparing</span>;
      case 'PACKED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-champagne/20 text-deep-espresso border border-champagne/50">Ready To Ship</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-terracotta/10 text-terracotta border border-terracotta/30">In Transit</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-orange-50 text-orange-800 border border-orange-200">Out For Delivery</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 font-sans"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Paid</span>;
      case 'COD_PENDING':
        return <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 font-sans"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>COD Pending</span>;
      case 'PENDING':
        return <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 font-sans"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>Pending</span>;
      case 'REFUNDED':
        return <span className="inline-flex items-center text-[10px] font-semibold text-purple-700 font-sans"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>Refunded</span>;
      default:
        return <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 font-sans"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl shadow-subtle border border-brand-border">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-serif-display font-medium text-deep-espresso">
                Orders & Fulfilment Hub
              </h1>
              <span className="bg-white/80 text-deep-espresso border border-brand-border text-[10px] px-2.5 py-0.5 rounded uppercase font-sans tracking-widest shadow-sm flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Operations Live
              </span>
            </div>
            <p className="text-xs font-sans text-brand-muted mt-1.5 max-w-2xl">
              Manage bespoke saree dispatch, atelier quality checklists, carrier tracking and customer transactional updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 bg-white/70 hover:bg-white text-deep-espresso border border-brand-border px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors shadow-sm"
              title="Export current filtered orders to CSV"
            >
              <Download className="w-3.5 h-3.5 text-terracotta" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="flex items-center space-x-1.5 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-4 py-2 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 7 KPI Operational Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. All Orders */}
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'ALL'
                ? 'bg-deep-espresso text-warm-ivory border-deep-espresso shadow-md ring-2 ring-terracotta/20'
                : 'sorayva-glass-card hover:border-terracotta/40'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'ALL' ? 'text-champagne' : 'text-brand-muted'}`}>
              All Orders
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.all}</p>
          </button>

          {/* 2. New Placed */}
          <button
            onClick={() => setSelectedStatus('PLACED')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'PLACED'
                ? 'bg-amber-800 text-white border-amber-800 shadow-md ring-2 ring-amber-500/20'
                : 'sorayva-glass-card hover:border-amber-400'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider flex items-center ${selectedStatus === 'PLACED' ? 'text-amber-200' : 'text-amber-700'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
              New Orders
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.placed}</p>
          </button>

          {/* 3. Awaiting Fulfilment */}
          <button
            onClick={() => setSelectedStatus('PROCESSING')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'PROCESSING' || selectedStatus === 'CONFIRMED'
                ? 'bg-indigo-900 text-white border-indigo-900 shadow-md ring-2 ring-indigo-500/20'
                : 'sorayva-glass-card hover:border-indigo-400'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'PROCESSING' ? 'text-indigo-200' : 'text-indigo-700'}`}>
              Awaiting Fulfil
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.awaitingFulfilment}</p>
          </button>

          {/* 4. Ready To Dispatch (Packed) */}
          <button
            onClick={() => setSelectedStatus('PACKED')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'PACKED'
                ? 'bg-terracotta text-white border-terracotta shadow-md ring-2 ring-terracotta/20'
                : 'sorayva-glass-card hover:border-terracotta'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'PACKED' ? 'text-champagne' : 'text-terracotta'}`}>
              Ready Dispatch
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.readyToDispatch}</p>
          </button>

          {/* 5. In Transit */}
          <button
            onClick={() => setSelectedStatus('SHIPPED')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'SHIPPED'
                ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500/20'
                : 'sorayva-glass-card hover:border-blue-400'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'SHIPPED' ? 'text-blue-200' : 'text-blue-700'}`}>
              In Transit
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.inTransit}</p>
          </button>

          {/* 6. Delivered */}
          <button
            onClick={() => setSelectedStatus('DELIVERED')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'DELIVERED'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20'
                : 'sorayva-glass-card hover:border-emerald-400'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'DELIVERED' ? 'text-emerald-200' : 'text-emerald-700'}`}>
              Delivered
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.delivered}</p>
          </button>

          {/* 7. Exceptions */}
          <button
            onClick={() => setSelectedStatus('CANCELLED')}
            className={`p-4 rounded-xl text-left transition-all duration-200 border ${
              selectedStatus === 'CANCELLED'
                ? 'bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-500/20'
                : 'sorayva-glass-card hover:border-rose-400'
            }`}
          >
            <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${selectedStatus === 'CANCELLED' ? 'text-rose-200' : 'text-rose-700'}`}>
              Exceptions
            </span>
            <p className="text-2xl font-serif-display mt-1">{loading ? '...' : counts.exceptions}</p>
          </button>
        </div>

        {/* Search, Filter Bar & Sorting */}
        <div className="sorayva-glass-card p-4 rounded-xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, AWB, SKU..."
              className="w-full h-10 pl-9 pr-4 text-xs font-sans bg-white/70 border border-brand-border rounded-lg focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-deep-espresso placeholder:text-brand-muted/50"
            />
            <Search className="w-4 h-4 text-brand-muted/60 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/60 hover:text-deep-espresso text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Payment Filter */}
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value as any)}
              className="h-10 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">Payment: All</option>
              <option value="PAID">Paid</option>
              <option value="COD_PENDING">COD Pending</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Courier Filter */}
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="h-10 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
            >
              <option value="ALL">Courier: All</option>
              <option value="Blue Dart Express">Blue Dart</option>
              <option value="Delhivery">Delhivery</option>
              <option value="DTDC Courier">DTDC</option>
              <option value="Speed Post (India Post)">Speed Post</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 text-xs font-sans bg-white/70 border border-brand-border rounded-lg text-deep-espresso focus:outline-none focus:border-terracotta"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="total_desc">Value: High to Low</option>
              <option value="total_asc">Value: Low to High</option>
            </select>

            {(selectedStatus !== 'ALL' || selectedPayment !== 'ALL' || selectedCourier !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSelectedPayment('ALL');
                  setSelectedCourier('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-terracotta hover:underline font-sans px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Orders Table (Desktop) */}
        <div className="hidden lg:block sorayva-glass-card rounded-xl border border-brand-border overflow-hidden shadow-subtle">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/60 bg-warm-ivory/50 text-[10px] uppercase font-sans font-semibold tracking-wider text-brand-muted">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Fulfilment</th>
                <th className="py-3.5 px-4">Courier / AWB</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-sans">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-brand-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-terracotta mb-2" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-brand-muted">
                    <Package className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
                    <p className="font-serif-display text-base text-deep-espresso">No orders match the selected filters.</p>
                    <p className="text-xs mt-1">Try resetting filters or expanding search criteria.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="hover:bg-white/40 transition-colors group"
                  >
                    {/* Order # */}
                    <td className="py-3.5 px-4 font-mono font-medium text-deep-espresso">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="hover:text-terracotta transition-colors flex items-center space-x-1"
                      >
                        <span>{order.orderNumber}</span>
                      </Link>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-brand-muted whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-deep-espresso">{order.customerName}</div>
                      <div className="text-[11px] text-brand-muted">{order.phone}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-deep-espresso">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} saree{order.items.length > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 text-right font-medium text-deep-espresso font-sans">
                      {formatPrice(order.total)}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4 text-center">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>

                    {/* Fulfilment */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.orderStatus)}
                    </td>

                    {/* Courier / AWB */}
                    <td className="py-3.5 px-4">
                      {order.shipment ? (
                        <div>
                          <div className="font-medium text-deep-espresso">{order.shipment.carrier}</div>
                          <div className="text-[11px] font-mono text-terracotta">{order.shipment.awbNumber}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-brand-muted/70 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="inline-flex items-center space-x-1 bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors shadow-sm group-hover:border-terracotta"
                      >
                        <Eye className="w-3.5 h-3.5 text-terracotta" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Mobile Order Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="sorayva-glass-card p-8 text-center text-brand-muted rounded-xl">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-terracotta mb-2" />
              <span>Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="sorayva-glass-card p-8 text-center text-brand-muted rounded-xl">
              <Package className="w-8 h-8 mx-auto text-brand-muted/40 mb-2" />
              <p className="font-serif-display text-base text-deep-espresso">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.orderId}
                href={`/admin/orders/${order.orderId}`}
                className="block sorayva-glass-card p-4 rounded-xl border border-brand-border shadow-sm hover:border-terracotta transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-deep-espresso">{order.orderNumber}</span>
                    <h3 className="text-sm font-medium text-deep-espresso mt-0.5">{order.customerName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-deep-espresso">{formatPrice(order.total)}</span>
                    <div className="text-[10px] text-brand-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-brand-border/40">
                  {getStatusBadge(order.orderStatus)}
                  {getPaymentBadge(order.paymentStatus)}
                  {order.shipment && (
                    <span className="text-[10px] text-brand-muted flex items-center ml-auto">
                      <Truck className="w-3 h-3 mr-1 text-terracotta" />
                      {order.shipment.carrier}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
