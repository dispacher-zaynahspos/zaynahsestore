'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { deleteProduct, updateProduct } from '@/lib/services/products';
import { triggerMetaSync } from '@/lib/services/metaSyncAction';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils/whatsapp';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  Loader2, 
  Globe 
} from '@/components/common/Icons';

interface ProductListProps {
  initialProducts: Product[];
  settings: StoreSettings;
}

export default function ProductList({ initialProducts, settings }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingFailed, setSyncingFailed] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disable/delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: false } : p));
      toast.success('Product disabled successfully');
    } catch (err) {
      toast.error('Failed to disable product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const nextActive = !product.active;
      await updateProduct(product.id, { active: nextActive }, product.images, product.variants, product.modifiers);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: nextActive } : p));
      toast.success(`Product ${nextActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error('Failed to update product state');
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await fetch('/api/meta-sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synced ${data.totalSynced} products to Meta catalog`);
        window.location.reload();
      } else {
        toast.error(`Sync failed: ${data.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('Bulk sync request failed');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncFailed = async () => {
    setSyncingFailed(true);
    try {
      const res = await fetch('/api/meta-sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'failed' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synced ${data.totalSynced} failed/pending products to Meta`);
        window.location.reload();
      } else {
        toast.error(`Sync failed: ${data.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (err) {
      toast.error('Retry sync request failed');
    } finally {
      setSyncingFailed(false);
    }
  };

  const handleSingleSync = async (productId: string) => {
    setSyncingProductId(productId);
    try {
      const res = await triggerMetaSync(productId);
      if (res.success) {
        toast.success('Product synced to Meta catalog successfully');
        setProducts(prev => prev.map(p => p.id === productId ? { 
          ...p, 
          meta_sync_status: 'synced', 
          meta_sync_error: null
        } : p));
      } else {
        toast.error(`Failed to sync: ${res.error}`);
        setProducts(prev => prev.map(p => p.id === productId ? { 
          ...p, 
          meta_sync_status: 'error', 
          meta_sync_error: res.error 
        } : p));
      }
    } catch (err: any) {
      toast.error('Sync failed');
    } finally {
      setSyncingProductId(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions header */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#1a1a2e]"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a30] text-gray-700 dark:text-gray-300 px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
            title="Sync all active products to Meta catalog"
          >
            {syncingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-blue-500" />}
            <span>Sync All to Meta</span>
          </button>
          <button
            onClick={handleSyncFailed}
            disabled={syncingFailed}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a30] text-gray-700 dark:text-gray-300 px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
            title="Retry failed/pending product syncs"
          >
            {syncingFailed ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-amber-500" />}
            <span>Retry Failed Syncs</span>
          </button>
          <Link
            href="/admin/products/new"
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Table listing */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No products found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Meta Sync</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProducts.map(product => {
                  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=60';
                  
                  const isSyncing = syncingProductId === product.id;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/20 dark:hover:bg-white/5 transition-all">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-[#0f0f1b]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={primaryImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a2e] dark:text-white line-clamp-1">{product.name}</p>
                          {product.category && (
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{product.category.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400">{product.sku || '—'}</td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{formatPrice(product.price, settings.currencySymbol)}</td>
                      <td className="py-4 px-6 font-semibold text-xs">
                        {product.hasVariants && product.variants ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Variants ({product.variants.reduce((sum, v) => sum + v.stock, 0)})</span>
                        ) : (
                          product.stock
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="flex items-center text-gray-500 hover:text-indigo-650 cursor-pointer"
                        >
                          {product.active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        {product.meta_sync_status === 'synced' ? (
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full" 
                            title={product.meta_last_synced_at ? `Synced at: ${new Date(product.meta_last_synced_at).toLocaleString()}` : 'Synced'}
                          >
                            🟢 Synced
                          </span>
                        ) : product.meta_sync_status === 'error' ? (
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full cursor-help" 
                            title={product.meta_sync_error || 'Sync failed'}
                          >
                            🔴 Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                            🟡 Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleSingleSync(product.id)}
                            disabled={isSyncing}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer"
                            title="Force Meta Sync"
                          >
                            {isSyncing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-50/10 transition-all cursor-pointer"
                            title="Disable/Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
