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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-lg border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <span>Saree Catalogue Management</span>
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-0.5 rounded border border-slate-700">
                {filteredProducts.length} Items
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live Google Sheets two-way sync table. Editing any product updates Google Sheets and invalidates public cache.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Saree</span>
          </Link>
        </div>

        {/* Sync Error Alert Banner */}
        {syncError && (
          <div className="bg-rose-950/80 border border-rose-800 p-4 rounded-lg space-y-2 text-rose-200 text-xs">
            <div className="flex items-center space-x-2 font-bold text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Google Sheets Sync Warning</span>
            </div>
            <p className="font-mono text-[11px] text-rose-300">{syncError}</p>
            <div className="bg-slate-950/60 p-3 rounded border border-rose-900/50 space-y-1 text-[11px] text-slate-300">
              <p className="font-semibold text-amber-400">Required Google Apps Script Action:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400 font-sans">
                <li>Open your Google Apps Script Editor.</li>
                <li>Click <strong className="text-slate-200">Deploy &gt; Manage deployments</strong>.</li>
                <li>Click the Edit icon (pencil), set <strong className="text-amber-300">Who has access</strong> to <strong className="text-emerald-400">"Anyone"</strong>.</li>
                <li>Select <strong className="text-slate-200">New version</strong> and click <strong className="text-slate-200">Deploy</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)}>×</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search Product ID, Name, Category, Fabric..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 uppercase tracking-wider font-semibold"
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
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
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
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-3 bg-slate-800 p-2.5 rounded border border-slate-700 text-xs font-sans">
              <span className="font-bold text-amber-400">{selectedIds.length} selected</span>
              <span className="text-slate-500">|</span>
              <button
                onClick={() => handleBulkStatus('Active')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
              >
                Bulk Publish
              </button>
              <button
                onClick={() => handleBulkStatus('Draft')}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
              >
                Bulk Unpublish (Draft)
              </button>
              <button
                onClick={() => handleBulkStatus('Discontinued')}
                className="bg-rose-900 hover:bg-rose-800 text-rose-200 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
              >
                Bulk Archive
              </button>
            </div>
          )}
        </div>

        {/* Product Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Loading catalogue from Google Sheets repository...</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <p className="text-sm font-semibold">No sarees match your current search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setFabricFilter('all');
                }}
                className="text-amber-400 text-xs underline font-semibold uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                      />
                    </th>
                    <th className="p-4 w-16">Image</th>
                    <th className="p-4">Product ID & Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Fabric</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedProducts.map((p) => {
                    const status = p.status || 'Active';
                    const stock = p.stock ?? p.stockQty ?? 0;
                    const mainImg = p.mainImage || (p.images && p.images[0]) || '';
                    const isSelected = selectedIds.includes(p.productId);

                    return (
                      <tr key={p.productId} className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-amber-950/20' : ''}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(p.productId)}
                            className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="w-12 h-16 relative bg-slate-950 border border-slate-800 rounded overflow-hidden">
                            <ProductImage src={mainImg} alt={p.productName || p.name || 'Saree'} fill sizes="80px" className="object-cover" />
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-amber-400 font-bold block">{p.productId}</span>
                            <span className="font-serif text-slate-100 block text-sm">{p.productName || p.name}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                              {p.featured && <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">Featured</span>}
                              {p.newArrival && <span className="bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded">New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">{p.category}</td>
                        <td className="p-4 text-slate-300">{p.fabric}</td>
                        <td className="p-4 font-mono font-bold text-slate-100">
                          {formatPrice(p.price || 0, p.currency || 'INR')}
                          {p.compareAtPrice && p.compareAtPrice > (p.price || 0) && (
                            <span className="block text-[10px] text-slate-500 line-through font-normal">
                              {formatPrice(p.compareAtPrice, p.currency || 'INR')}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono">
                          <span className={stock <= 0 ? 'text-rose-400 font-bold' : stock <= 3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                              status === 'Active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : status === 'Draft'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : status === 'Out of Stock'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewProduct(p)}
                              title="Live Customer Storefront Preview"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${p.productId}/edit`}
                              title="Edit product specifications"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(p)}
                              title="Duplicate as new draft saree"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Publish / Unpublish Toggle */}
                            {status === 'Active' ? (
                              <button
                                onClick={() => handleStatusChange(p.productId, 'Draft')}
                                title="Unpublish to Draft"
                                className="p-1.5 bg-amber-950 hover:bg-amber-900 text-amber-400 rounded transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(p.productId, 'Active')}
                                title="Publish Active to storefront"
                                className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Archive */}
                            <button
                              onClick={() => handleStatusChange(p.productId, 'Discontinued')}
                              title="Archive saree"
                              className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded transition-colors"
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
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing <strong className="text-slate-200">{startIndex + 1}</strong> to{' '}
                <strong className="text-slate-200">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of{' '}
                <strong className="text-slate-200">{filteredProducts.length}</strong> items
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-200 font-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
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
