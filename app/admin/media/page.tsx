'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Copy, Check, Upload, Image as ImageIcon, Search, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadProductImage, deleteProductImage } from '@/lib/services/storage';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  url: string;
  alt?: string;
  productId: string;
  productName?: string;
  sortOrder: number;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_images')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia((data || []).map((row: any) => ({
        id: row.id,
        url: row.url,
        alt: row.alt,
        productId: row.product_id,
        productName: row.products?.name,
        sortOrder: row.sort_order || 0,
        createdAt: row.created_at
      })));
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setUploading(true);
      const supabase = createClient();
      await Promise.all(
        files.map(async f => {
          const url = await uploadProductImage(f, 'library');
          const { error } = await supabase.from('product_images').insert({
            url,
            alt: f.name,
            product_id: null,
          });
          if (error) throw error;
        })
      );
      toast.success(`${files.length} file(s) uploaded`);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('URL copied!');
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      const supabase = createClient();
      await supabase.from('product_images').delete().eq('id', id);
      await deleteProductImage(url).catch(() => {}); // best-effort storage delete
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} image(s)?`)) return;
    const toDelete = media.filter(m => selectedIds.has(m.id));
    try {
      const supabase = createClient();
      await Promise.all(toDelete.map(async m => {
        await supabase.from('product_images').delete().eq('id', m.id);
        await deleteProductImage(m.url).catch(() => {});
      }));
      setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      toast.success('Images deleted');
    } catch {
      toast.error('Failed to delete some images');
    }
  };

  const filtered = media.filter(m =>
    !search || (m.url + (m.alt || '') + (m.productName || '')).toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {media.length} image{media.length !== 1 ? 's' : ''} · Manage all product images
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedIds.size}
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e94560] text-white text-sm font-bold hover:bg-[#d8344e] transition-colors cursor-pointer disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload Images'}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by filename, product name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">
            {search ? 'No images match your search' : 'No images uploaded yet'}
          </p>
          {!search && (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e94560] text-white text-sm font-bold cursor-pointer hover:bg-[#d8344e] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(item => {
            const isSelected = selectedIds.has(item.id);
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#e94560] ring-2 ring-[#e94560]/30'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || 'Product image'}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Selected overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#e94560]/20 flex items-center justify-center">
                    <div className="h-7 w-7 rounded-full bg-[#e94560] flex items-center justify-center shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Hover actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-between p-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleCopy(item.id, item.url); }}
                      className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleDelete(item.id, item.url); }}
                      className="h-7 w-7 rounded-lg bg-white/10 hover:bg-red-500/80 flex items-center justify-center text-white transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {item.productName && (
                    <span className="text-[10px] text-white/80 font-semibold line-clamp-1 max-w-full bg-black/30 px-1.5 py-0.5 rounded">
                      {item.productName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
