'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Trash2, 
  Copy, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Search, 
  Zap, 
  CheckCircle2, 
  Loader2,
  Edit,
  SlidersHorizontal,
  X,
  Plus
} from '@/components/common/Icons';
import { toast } from 'sonner';

interface MediaLibraryItem {
  id: string;
  original_filename: string;
  seo_filename: string;
  file_url: string;
  alt_text: string;
  title: string;
  description: string;
  caption: string;
  ai_generated: boolean;
  ai_enabled: boolean;
  bucket: string;
  created_at: string;
}

export default function MediaLibraryClient() {
  const [media, setMedia] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiFilter, setAiFilter] = useState<'all' | 'generated' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Settings & Toggles
  const [globalAi, setGlobalAi] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Edit inline state
  const [editingItem, setEditingItem] = useState<MediaLibraryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
    fetchAiSettings();
  }, []);

  const fetchAiSettings = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('ai_settings')
        .select('auto_media_ai')
        .eq('id', '00000000-0000-4000-8000-000000000002')
        .single();
      if (data) {
        setGlobalAi(data.auto_media_ai);
      }
    } catch (err) {
      console.warn('[Media Library] Could not load global AI settings:', err);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase.from('media_library').select('*');

      if (search.trim()) {
        query = query.ilike('original_filename', `%${search}%`);
      }

      if (aiFilter === 'generated') {
        query = query.eq('ai_generated', true);
      } else if (aiFilter === 'pending') {
        query = query.eq('ai_generated', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (err: any) {
      console.error('[Media Library] Load error:', err);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalAiToggle = async () => {
    const nextVal = !globalAi;
    setGlobalAi(nextVal);
    try {
      const supabase = createClient();
      await supabase
        .from('ai_settings')
        .update({ auto_media_ai: nextVal })
        .eq('id', '00000000-0000-4000-8000-000000000002');
      toast.success(`Auto vision tags toggled ${nextVal ? 'ON' : 'OFF'}`);
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'product-images');

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Upload endpoint failed');
        }
      }
      toast.success('All files uploaded successfully!', { id: toastId });
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'File upload failed', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSingleGenerate = async (item: MediaLibraryItem) => {
    try {
      setGeneratingId(item.id);
      const response = await fetch('/api/media/ai-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: item.file_url, media_id: item.id })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to generate meta');

      toast.success(`AI alt tags written for: ${item.original_filename}`);
      fetchMedia();
    } catch (err: any) {
      toast.error(err.message || 'AI metadata write failed');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkGenerating(true);
      const itemsToGen = media.filter(m => selectedIds.includes(m.id));
      const toastId = toast.loading(`Generating metadata sequentially for ${itemsToGen.length} files...`);

      for (const item of itemsToGen) {
        try {
          await fetch('/api/media/ai-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: item.file_url, media_id: item.id })
          });
          // Small delay to respect vision API rate limits
          await new Promise(res => setTimeout(res, 600));
        } catch (e) {
          console.warn('[Media Bulk Vision] Skipped item due to failure:', item.original_filename, e);
        }
      }

      toast.success('Bulk vision metadata complete!', { id: toastId });
      setSelectedIds([]);
      fetchMedia();
    } catch (err: any) {
      toast.error('Bulk vision process failed');
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('media_library')
        .update({
          alt_text: editingItem.alt_text,
          title: editingItem.title,
          description: editingItem.description,
          caption: editingItem.caption,
          ai_enabled: editingItem.ai_enabled
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      toast.success('Image details updated');
      setEditingItem(null);
      fetchMedia();
    } catch (err: any) {
      toast.error('Failed to update image details');
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Delete this file from database and media storage?')) return;
    try {
      const supabase = createClient();
      await supabase.from('media_library').delete().eq('id', id);
      
      // Attempt storage deletion
      const filename = url.split('/').pop();
      if (filename) {
        await supabase.storage.from('product-images').remove([filename]);
      }

      toast.success('Media file deleted');
      fetchMedia();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === media.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(media.map(m => m.id));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Media Library & Image SEO</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload files, view AI tags, edit alt texts, and trigger vision descriptions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkGenerate}
              disabled={bulkGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
            >
              {bulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Bulk Vision AI ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold active:scale-95 disabled:bg-gray-100 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* Settings Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between w-full p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800 min-h-[50px] px-4">
            <div className="mr-8">
              <span className="text-sm font-bold text-gray-950 dark:text-white">Auto Vision Tagging</span>
              <span className="text-[10px] text-gray-400 block leading-none mt-0.5">Analyze and add alt tags automatically on upload.</span>
            </div>
            <input
              type="checkbox"
              checked={globalAi}
              onChange={handleGlobalAiToggle}
              className="w-10 h-6 rounded-full bg-gray-200 checked:bg-blue-600 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'generated', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => { setAiFilter(status); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border min-h-[38px] flex-1 md:flex-none capitalize transition-all cursor-pointer ${
                aiFilter === status
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {status === 'all' ? 'All Images' : status === 'generated' ? 'AI Tagged' : 'Pending'}
            </button>
          ))}
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[38px] cursor-pointer"
          >
            {selectedIds.length === media.length && media.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Grid of Images */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
          No images uploaded in media library.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isGenerating = generatingId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-gray-50/20 dark:bg-gray-900/10 cursor-pointer flex flex-col justify-end transition-all ${
                  isSelected 
                    ? 'border-blue-600 shadow-md scale-98' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 left-3 h-4.5 w-4.5 text-blue-600 rounded border-gray-300 cursor-pointer z-10"
                />

                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.file_url}
                  alt={item.alt_text}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* AI tag badge */}
                <div className="absolute top-3 right-3 z-10">
                  {item.ai_generated ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-500/80 text-white shadow-sm">
                      None
                    </span>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.file_url); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]"
                      title="Edit metadata"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.file_url); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer min-h-[32px]"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-white font-mono line-clamp-1 w-full bg-black/40 p-1 rounded">
                      Alt: {item.alt_text || 'None'}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleSingleGenerate(item); }}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:bg-gray-600 text-[10px] transition-all cursor-pointer"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Write Vision AI</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Form Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Edit Image Metadata</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Alt Text Tag</label>
                <input
                  type="text"
                  value={editingItem.alt_text}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, alt_text: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Title Tag</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Long Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Short Caption</label>
                <input
                  type="text"
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, caption: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Vision AI Updates</span>
                <input
                  type="checkbox"
                  checked={editingItem.ai_enabled}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, ai_enabled: e.target.checked } : null)}
                  className="w-10 h-6 rounded-full bg-gray-200 checked:bg-blue-600 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-xs cursor-pointer min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer min-h-[38px] active:scale-95"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
