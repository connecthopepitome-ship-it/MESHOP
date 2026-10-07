'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct, CatalogueHealthReport } from '@/types';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
  Sparkles,
  Flame,
  Activity,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [healthReport, setHealthReport] = useState<CatalogueHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const adminProds = await repository.getAdminProducts();
        setProducts(adminProds || []);
        const health = await repository.getCatalogueHealthReport();
        setHealthReport(health);
      } catch (e) {
        console.error('Failed to load admin dashboard metrics:', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeIssues = healthReport && Array.isArray(healthReport.issues) ? healthReport.issues : [];

  const totalProducts = safeProducts.length;
  const activeCount = safeProducts.filter((p) => p.status === 'Active').length;
  const draftCount = safeProducts.filter((p) => p.status === 'Draft').length;
  const outOfStockCount = safeProducts.filter((p) => p.status === 'Out of Stock' || (p.stock ?? p.stockQty) <= 0).length;
  const lowStockCount = safeProducts.filter((p) => (p.stock ?? p.stockQty) > 0 && (p.stock ?? p.stockQty) <= 3).length;
  const newArrivalsCount = safeProducts.filter((p) => p.newArrival).length;
  const featuredCount = safeProducts.filter((p) => p.featured).length;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl shadow-subtle">
          <div>
            <h1 className="text-2xl font-serif-display font-medium text-deep-espresso flex items-center space-x-3">
              <span>SORAYVA Overview</span>
              <span className="bg-white/80 text-deep-espresso border border-brand-border text-[10px] px-2 py-0.5 rounded uppercase font-sans tracking-widest shadow-sm flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Live Sync
              </span>
            </h1>
            <p className="text-sm font-sans text-brand-muted mt-2 max-w-2xl">
              Central catalogue control centre for managing customer-facing saree collections and internal sourcing mapping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center space-x-2 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white px-5 py-2.5 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Saree</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center space-x-2 bg-white/60 hover:bg-white text-deep-espresso border border-brand-border px-5 py-2.5 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-colors shadow-sm"
            >
              <Package className="w-4 h-4 text-terracotta" />
              <span>Catalogue</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-brand-muted uppercase tracking-wider">Total Products</span>
            <p className="text-2xl font-serif-display text-deep-espresso">{loading ? '...' : totalProducts}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-emerald-600 uppercase tracking-wider flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Active</span>
            <p className="text-2xl font-serif-display text-emerald-700">{loading ? '...' : activeCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-amber-600 uppercase tracking-wider">Draft</span>
            <p className="text-2xl font-serif-display text-amber-700">{loading ? '...' : draftCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-rose-600 uppercase tracking-wider">Out of Stock</span>
            <p className="text-2xl font-serif-display text-rose-700">{loading ? '...' : outOfStockCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-orange-600 uppercase tracking-wider">Low Stock</span>
            <p className="text-2xl font-serif-display text-orange-700">{loading ? '...' : lowStockCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-sky-600 uppercase tracking-wider">New Arrivals</span>
            <p className="text-2xl font-serif-display text-sky-700">{loading ? '...' : newArrivalsCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <span className="text-[10px] font-sans font-semibold text-purple-600 uppercase tracking-wider">Featured</span>
            <p className="text-2xl font-serif-display text-purple-700">{loading ? '...' : featuredCount}</p>
          </div>

          <div className="sorayva-glass-card p-4 rounded-xl space-y-1.5 shadow-sm transition-transform hover:-translate-y-0.5 duration-200 bg-brand-surface/30">
            <span className="text-[10px] font-sans font-semibold text-terracotta uppercase tracking-wider">Health Score</span>
            <p className="text-2xl font-serif-display text-terracotta">
              {loading ? '...' : `${healthReport?.healthScore || 100}%`}
            </p>
          </div>
        </div>

        {/* Two-Column Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Catalogue Health Auditor */}
          <div className="lg:col-span-2 sorayva-glass-card rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b fine-border pb-4">
              <div>
                <h2 className="text-lg font-serif-display text-deep-espresso flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-terracotta" />
                  <span>Catalogue Health</span>
                </h2>
                <p className="text-xs font-sans text-brand-muted mt-1">
                  Automated validation scanning for missing prices, images, categories, or inventory anomalies.
                </p>
              </div>
              <span className="text-[10px] font-sans uppercase tracking-widest font-semibold bg-white border border-brand-border px-3 py-1.5 rounded-lg text-deep-espresso shadow-sm">
                Issues: {safeIssues.length}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center font-sans text-brand-muted text-sm">Scanning Google Sheets catalogue data...</div>
            ) : safeIssues.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {safeIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border text-sm font-sans flex items-center justify-between transition-colors ${
                      issue.severity === 'ERROR'
                        ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                        : 'bg-amber-50/50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {issue.severity === 'ERROR' ? (
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-deep-espresso mr-2 tracking-wide text-xs">[{issue.issueType}]</span>
                        <span className="font-medium text-deep-espresso">{issue.productName || issue.productId}</span>
                        <p className="text-xs opacity-80 mt-0.5">{issue.message}</p>
                      </div>
                    </div>

                    {issue.productId && (
                      <Link
                        href={`/admin/products/${issue.productId}/edit`}
                        className="bg-white hover:bg-brand-surface text-deep-espresso border border-brand-border px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-widest flex items-center space-x-1 flex-shrink-0 transition-colors shadow-sm"
                      >
                        <span>Fix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white/40 border border-brand-border rounded-xl space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-serif-display font-medium text-deep-espresso">Catalogue Health 100% Valid</h3>
                <p className="text-sm font-sans text-brand-muted max-w-md mx-auto">
                  Zero pricing, image, category, or status anomalies found in the active Google Sheets catalogue.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Sourcing & Security Summary */}
          <div className="space-y-6">
            <div className="sorayva-glass-card rounded-xl p-6 space-y-5 shadow-sm">
              <h2 className="text-sm font-sans font-semibold uppercase tracking-wider text-deep-espresso flex items-center space-x-2 border-b fine-border pb-3">
                <ShieldCheck className="w-4 h-4 text-terracotta" />
                <span>Security & Sync</span>
              </h2>

              <div className="space-y-4 text-sm font-sans text-brand-muted leading-relaxed">
                <p className="flex space-x-2">
                  <span className="text-emerald-600 mt-0.5">✦</span> 
                  <span><strong>Google Sheets Sync:</strong> Updates write directly to Google Sheets and clear the public catalogue cache.</span>
                </p>
                <p className="flex space-x-2">
                  <span className="text-terracotta mt-0.5">✦</span> 
                  <span><strong>Internal Isolation:</strong> Sourcing links and costs are visible <em>only</em> in admin. They are never exported to public APIs.</span>
                </p>
              </div>

              <div className="pt-4 border-t fine-border">
                <Link
                  href="/admin/products"
                  className="w-full bg-white/60 hover:bg-white text-deep-espresso border border-brand-border py-2.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <span>View Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
