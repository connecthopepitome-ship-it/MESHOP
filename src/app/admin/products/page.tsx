'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { repository } from '@/lib/api/googleSheetsRepository';
import { InternalProduct, ProductStatus } from '@/types';
import { ProductImage } from '@/components/shared/ProductImage';
import { LiveProductPreviewModal } from '@/components/admin/LiveProductPreviewModal';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import {
  Search,
  Filter,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InternalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fabricFilter, setFabricFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'stock' | 'name'>('newest');

  // Multi-select bulk state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewProduct, setPreviewProduct] = useState<InternalProduct | null>(null);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.products)) {
        const merged = repository.applyClientOverrides<InternalProduct>(json.products);
        setProducts(merged);
      } else {
        const errStr = json.error || 'Failed to fetch products from Google Sheets.';
        setSyncError(errStr);
        setProducts(repository.applyClientOverrides<InternalProduct>(json.products || []));
      }
    } catch (e: any) {
      console.error('Failed to load admin products:', e);
      setSyncError(`Network error connecting to Admin API: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Filter & Sort Effect
  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.productId.toLowerCase().includes(q) ||
          (p.productName || p.name || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => (p.status || 'Active') === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (fabricFilter !== 'all') {
      result = result.filter((p) => p.fabric.toLowerCase() === fabricFilter.toLowerCase());
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.publishDate || b.createdAt || '').localeCompare(a.publishDate || a.createdAt || ''));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.publishDate || a.createdAt || '').localeCompare(b.publishDate || b.createdAt || ''));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'stock') {
      result.sort((a, b) => (a.stock ?? a.stockQty) - (b.stock ?? b.stockQty));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.productName || a.name || '').localeCompare(b.productName || b.name || ''));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, search, statusFilter, categoryFilter, fabricFilter, sortBy]);

  // Actions
  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    setToastMsg(`Updating status to ${newStatus}...`);
    try {
      await repository.updateProductStatus(productId, newStatus);
      fetch('/api/admin/products/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status: newStatus })
      }).catch((e) => console.warn('Status sync warning:', e));

      setToastMsg(`Product ${productId} status updated to ${newStatus}.`);
      loadProducts();
    } catch (e: any) {
      setToastMsg(`Status update error: ${e.message}`);
    } finally {
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const handleDuplicate = async (p: InternalProduct) => {
    const newId = `SAR-${Date.now().toString(36).toUpperCase().substring(0, 6)}`;
    const duplicated: InternalProduct = {
      ...p,
      productId: newId,
      productName: `${p.productName || p.name} (Copy)`,
      name: `${p.productName || p.name} (Copy)`,
      status: 'Draft'
    };

    setToastMsg(`Duplicating saree as new draft ${newId}...`);
    try {
      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: duplicated })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setToastMsg(`Duplicated ${p.productId} to new draft ${newId}. Saved to Google Sheets.`);
        loadProducts();
      } else {
        setToastMsg(`Duplication failed: ${json.error || 'Server error'}`);
      }
    } catch (e: any) {
      setToastMsg(`Duplication error: ${e.message}`);
    } finally {
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const handleBulkStatus = async (newStatus: ProductStatus) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to set status = ${newStatus} for ${selectedIds.length} selected sarees?`)) return;

    setToastMsg(`Bulk updating ${selectedIds.length} sarees in Google Sheets...`);
    for (const id of selectedIds) {
      await fetch('/api/admin/products/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, status: newStatus })
      });
    }
    setToastMsg(`Bulk status updated to ${newStatus}. Catalogue cache refreshed.`);
    setSelectedIds([]);
    loadProducts();
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.productId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sorayva-glass-card p-6 rounded-xl shadow-subtle">
          <div>
            <h1 className="text-xl font-serif-display font-medium text-deep-espresso flex items-center space-x-3">
              <span>Saree Catalogue</span>
              <span className="text-[10px] bg-white text-deep-espresso font-sans uppercase tracking-widest px-2.5 py-0.5 rounded-full border fine-border shadow-sm">
                {filteredProducts.length} Items
              </span>
            </h1>
            <p className="text-sm font-sans text-brand-muted mt-1.5 max-w-xl leading-relaxed">
              Live Google Sheets two-way sync table. Editing any product updates Google Sheets and invalidates public cache.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center space-x-2 bg-deep-espresso hover:bg-terracotta text-champagne hover:text-white font-sans font-medium px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm w-fit shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Saree</span>
          </Link>
        </div>

        {/* Sync Error Alert Banner */}
        {syncError && (
          <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-xl space-y-2 text-rose-900 text-sm font-sans shadow-sm">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Google Sheets Sync Warning</span>
            </div>
            <p className="font-mono text-xs text-rose-700">{syncError}</p>
            <div className="bg-white/60 p-3 rounded-lg border border-rose-100 space-y-1.5 text-xs text-rose-800">
              <p className="font-bold uppercase tracking-wider">Required Google Apps Script Action:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Open your Google Apps Script Editor.</li>
                <li>Click <strong>Deploy &gt; Manage deployments</strong>.</li>
                <li>Click the Edit icon, set <strong>Who has access</strong> to <strong>"Anyone"</strong>.</li>
                <li>Select <strong>New version</strong> and click <strong>Deploy</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg text-xs font-sans font-medium flex items-center justify-between shadow-sm animate-fadeIn">
            <span className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4" /> <span>{toastMsg}</span></span>
            <button onClick={() => setToastMsg(null)} className="hover:opacity-60 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="sorayva-glass-card p-4 rounded-xl space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-muted" />
              <input
                type="text"
                placeholder="Search ID, Name, Category, Fabric..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 border border-brand-border rounded-lg py-2.5 pl-10 pr-3 text-xs font-sans text-deep-espresso placeholder:text-brand-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/60 border border-brand-border rounded-lg px-3 py-2.5 text-xs font-sans font-medium text-deep-espresso uppercase tracking-wider focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active (Public)</option>
              <option value="Draft">Draft (Private)</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Hidden">Hidden</option>
              <option value="Discontinued">Discontinued</option>
            </select>

            {/* Fabric Filter */}
            <select
              value={fabricFilter}
              onChange={(e) => setFabricFilter(e.target.value)}
              className="bg-white/60 border border-brand-border rounded-lg px-3 py-2.5 text-xs font-sans text-deep-espresso focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
            >
              <option value="all">All Fabrics</option>
              <option value="Silk">Silk</option>
              <option value="Organza">Organza</option>
              <option value="Georgette">Georgette</option>
              <option value="Chiffon">Chiffon</option>
              <option value="Cotton">Cotton</option>
              <option value="Linen">Linen</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/60 border border-brand-border rounded-lg px-3 py-2.5 text-xs font-sans font-medium text-deep-espresso uppercase tracking-wider focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-shadow appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center flex-wrap gap-3 bg-white/80 p-3 rounded-lg border border-brand-border text-xs font-sans shadow-sm animate-fadeIn">
              <span className="font-bold text-terracotta uppercase tracking-widest bg-brand-surface px-2 py-1 rounded">{selectedIds.length} selected</span>
              <span className="text-brand-border hidden sm:inline">|</span>
              <button
                onClick={() => handleBulkStatus('Active')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Bulk Publish
              </button>
              <button
                onClick={() => handleBulkStatus('Draft')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Bulk Draft
              </button>
              <button
                onClick={() => handleBulkStatus('Discontinued')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Bulk Archive
              </button>
            </div>
          )}
        </div>

        {/* Product Table */}
        <div className="sorayva-glass-card rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-brand-muted text-sm font-sans animate-pulse">Loading catalogue from Google Sheets...</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-16 text-center text-deep-espresso space-y-4">
              <p className="text-base font-serif-display font-medium">No sarees match your current search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setFabricFilter('all');
                }}
                className="text-terracotta text-xs font-sans font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                <thead className="bg-white/40 text-brand-muted border-b border-brand-border uppercase tracking-widest font-semibold text-[10px]">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-brand-border/80 bg-white text-terracotta focus:ring-terracotta cursor-pointer w-4 h-4 shadow-sm"
                      />
                    </th>
                    <th className="p-4 w-20">Image</th>
                    <th className="p-4 min-w-[200px]">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Fabric</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-deep-espresso bg-white/20">
                  {paginatedProducts.map((p) => {
                    const status = p.status || 'Active';
                    const stock = p.stock ?? p.stockQty ?? 0;
                    const mainImg = p.mainImage || (p.images && p.images[0]) || '';
                    const isSelected = selectedIds.includes(p.productId);

                    return (
                      <tr key={p.productId} className={`hover:bg-white/50 transition-colors ${isSelected ? 'bg-champagne/10' : ''}`}>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(p.productId)}
                            className="rounded border-brand-border/80 bg-white text-terracotta focus:ring-terracotta cursor-pointer w-4 h-4 shadow-sm"
                          />
                        </td>
                        <td className="p-4">
                          <div className="w-14 h-[76px] relative bg-brand-surface border border-brand-border/60 rounded-md overflow-hidden shadow-sm">
                            {mainImg ? (
                              <ProductImage src={mainImg} alt={p.productName || p.name || 'Saree'} fill sizes="80px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-muted font-serif-display uppercase tracking-widest bg-warm-ivory">
                                No Img
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] text-brand-muted font-medium bg-white px-1.5 py-0.5 rounded border fine-border">{p.productId}</span>
                            <span className="font-serif-editorial text-deep-espresso font-medium block text-base truncate max-w-[250px]" title={p.productName || p.name}>{p.productName || p.name}</span>
                            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-widest font-sans font-semibold">
                              {p.featured && <span className="bg-champagne/20 text-deep-espresso border border-champagne/40 px-1.5 py-0.5 rounded shadow-sm">Featured</span>}
                              {p.newArrival && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded shadow-sm">New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-brand-muted">{p.category}</td>
                        <td className="p-4 text-brand-muted">{p.fabric}</td>
                        <td className="p-4 font-sans text-sm text-deep-espresso">
                          {formatPrice(p.price || 0, p.currency || 'INR')}
                          {p.compareAtPrice && p.compareAtPrice > (p.price || 0) && (
                            <span className="block text-[11px] text-brand-muted line-through font-normal mt-0.5">
                              {formatPrice(p.compareAtPrice, p.currency || 'INR')}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-medium">
                          <span className={stock <= 0 ? 'text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-200' : stock <= 3 ? 'text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-200' : 'text-deep-espresso'}>
                            {stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest inline-flex items-center shadow-sm ${
                              status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status === 'Draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : status === 'Out of Stock'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewProduct(p)}
                              title="Preview Live Storefront"
                              className="p-2 bg-white hover:bg-brand-surface text-brand-muted hover:text-deep-espresso border border-brand-border rounded-md transition-colors shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${p.productId}/edit`}
                              title="Edit Saree"
                              className="p-2 bg-white hover:bg-brand-surface text-terracotta border border-brand-border rounded-md transition-colors shadow-sm"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(p)}
                              title="Duplicate Saree"
                              className="p-2 bg-white hover:bg-brand-surface text-brand-muted hover:text-deep-espresso border border-brand-border rounded-md transition-colors shadow-sm"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Publish / Unpublish Toggle */}
                            {status === 'Active' ? (
                              <button
                                onClick={() => handleStatusChange(p.productId, 'Draft')}
                                title="Unpublish to Draft"
                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(p.productId, 'Active')}
                                title="Publish to Storefront"
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Archive */}
                            <button
                              onClick={() => handleStatusChange(p.productId, 'Discontinued')}
                              title="Archive Saree"
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md transition-colors shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="bg-white/50 px-6 py-4 border-t fine-border flex items-center justify-between text-xs font-sans text-brand-muted">
              <span>
                Showing <strong className="text-deep-espresso font-medium">{startIndex + 1}</strong> to{' '}
                <strong className="text-deep-espresso font-medium">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of{' '}
                <strong className="text-deep-espresso font-medium">{filteredProducts.length}</strong> items
              </span>

              <div className="flex items-center space-x-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 bg-white hover:bg-brand-surface border border-brand-border disabled:opacity-40 rounded-md text-deep-espresso shadow-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-deep-espresso font-semibold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 bg-white hover:bg-brand-surface border border-brand-border disabled:opacity-40 rounded-md text-deep-espresso shadow-sm transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      <LiveProductPreviewModal
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        product={previewProduct}
      />
    </AdminLayout>
  );
}
