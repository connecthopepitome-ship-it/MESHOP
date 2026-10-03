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
        setProducts(adminProds);
        const health = await repository.getCatalogueHealthReport();
        setHealthReport(health);
      } catch (e) {
        console.error('Failed to load admin dashboard metrics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const draftCount = products.filter((p) => p.status === 'Draft').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock' || (p.stock ?? p.stockQty) <= 0).length;
  const lowStockCount = products.filter((p) => (p.stock ?? p.stockQty) > 0 && (p.stock ?? p.stockQty) <= 3).length;
  const newArrivalsCount = products.filter((p) => p.newArrival).length;
  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-lg border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <span>SORAYVA Catalogue Dashboard</span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded uppercase font-semibold">
                Google Sheets Live Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Central catalogue control centre for managing customer-facing saree collections and internal sourcing mapping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Saree</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span>Manage Catalogue</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
            <p className="text-2xl font-bold text-slate-100 font-mono">{loading ? '...' : totalProducts}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{loading ? '...' : activeCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Draft</span>
            <p className="text-2xl font-bold text-amber-400 font-mono">{loading ? '...' : draftCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Out of Stock</span>
            <p className="text-2xl font-bold text-rose-400 font-mono">{loading ? '...' : outOfStockCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Low Stock</span>
            <p className="text-2xl font-bold text-orange-400 font-mono">{loading ? '...' : lowStockCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">New Arrivals</span>
            <p className="text-2xl font-bold text-sky-400 font-mono">{loading ? '...' : newArrivalsCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Featured</span>
            <p className="text-2xl font-bold text-purple-400 font-mono">{loading ? '...' : featuredCount}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Health Score</span>
            <p className="text-2xl font-bold text-amber-400 font-mono">
              {loading ? '...' : `${healthReport?.healthScore || 100}%`}
            </p>
          </div>
        </div>

        {/* Two-Column Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Catalogue Health Auditor */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <span>Internal Catalogue Health Auditor</span>
                </h2>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  Automated validation scanning for missing prices, images, categories, or inventory anomalies.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded text-slate-300">
                Issues Detected: {healthReport?.issues.length || 0}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Scanning Google Sheets catalogue data...</div>
            ) : healthReport && healthReport.issues.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {healthReport.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      issue.severity === 'ERROR'
                        ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                        : 'bg-amber-950/30 border-amber-900/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {issue.severity === 'ERROR' ? (
                        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-bold font-mono text-slate-100 mr-2">[{issue.issueType}]</span>
                        <span className="font-medium text-slate-200">{issue.productName || issue.productId}</span>
                        <p className="text-[11px] opacity-80 mt-0.5">{issue.message}</p>
                      </div>
                    </div>

                    {issue.productId && (
                      <Link
                        href={`/admin/products/${issue.productId}/edit`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded text-[11px] font-medium uppercase tracking-wider flex items-center space-x-1 flex-shrink-0"
                      >
                        <span>Fix Issue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">Catalogue Health 100% Valid</h3>
                <p className="text-xs text-slate-400">
                  Zero pricing, image, category, or status anomalies found in the active Google Sheets catalogue.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Sourcing & Security Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Security & Two-Way Sync</span>
              </h2>

              <div className="space-y-3 text-xs text-slate-300 font-light leading-relaxed">
                <p>
                  ✅ <strong>Google Sheets Source of Truth:</strong> When products are saved or updated here, they write directly to Google Sheets and clear the public catalogue cache.
                </p>
                <p>
                  🔒 <strong>Internal Field Isolation:</strong> Meesho Reference Links, Source Costs, and Supplier References are visible <em>only</em> on this admin dashboard. They are never exported to public customer APIs.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Link
                  href="/admin/products"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Open Product Management Table</span>
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
