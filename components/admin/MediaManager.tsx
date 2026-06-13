'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Play, 
  Trash2, 
  Copy, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Edit, 
  SlidersHorizontal, 
  Plus 
} from '@/components/common/Icons';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface MediaManagerProps {
  mode: 'library' | 'selector';
  onSelect?: (urls: string[]) => void;
  multiple?: boolean;
  onClose?: () => void;
}

interface MediaItem {
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
  file_size?: number;
  mime_type?: string;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

export default function MediaManager({ mode, onSelect, multiple = false, onClose }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiFilter, setAiFilter] = useState<'all' | 'generated' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size-desc' | 'size-asc'>('newest');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  
  // Usage Cross-Reference States
  const [usedUrls, setUsedUrls] = useState<Set<string>>(new Set());
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last_7' | 'last_30'>('all');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<Set<string>>(new Set());

  // Upload Queue state
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vision AI settings
  const [globalAi, setGlobalAi] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Edit metadata form modal state
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // WebM Warning state
  const [pendingVideoUpload, setPendingVideoUpload] = useState<{ task: UploadTask; file: File } | null>(null);

  // 1. Initial Data Loads
  useEffect(() => {
    fetchMedia();
    loadUsageCrossReferences();
    if (mode === 'library') {
      fetchAiSettings();
    }
  }, [search, aiFilter, sortBy, typeFilter]);

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
      console.warn('[Media Manager] Could not load global AI settings:', err);
    }
  };

  const loadUsageCrossReferences = async () => {
    try {
      const supabase = createClient();
      const [cats, variants, sizeGuides, settings, sections, productImgs] = await Promise.all([
        supabase.from('categories').select('image_url'),
        supabase.from('product_variants').select('image_url'),
        supabase.from('size_guides').select('image_url'),
        supabase.from('store_settings').select('logo_url, favicon_url, banner_url, exit_intent_image_url').single(),
        supabase.from('homepage_sections').select('settings, content_data'),
        supabase.from('product_images').select('url')
      ]);

      const inUse = new Set<string>();
      cats.data?.forEach(c => c.image_url && inUse.add(c.image_url));
      variants.data?.forEach(v => v.image_url && inUse.add(v.image_url));
      sizeGuides.data?.forEach(sg => sg.image_url && inUse.add(sg.image_url));
      productImgs.data?.forEach(pi => pi.url && inUse.add(pi.url));
      if (settings.data) {
        const s = settings.data;
        if (s.logo_url) inUse.add(s.logo_url);
        if (s.favicon_url) inUse.add(s.favicon_url);
        if (s.banner_url) inUse.add(s.banner_url);
        if (s.exit_intent_image_url) inUse.add(s.exit_intent_image_url);
      }

      setUsedUrls(inUse);
      setSectionsData(sections.data || []);
    } catch (err) {
      console.error('[Media Manager] Failed to load usage references:', err);
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

      // Filter by type
      if (typeFilter === 'image') {
        query = query.like('mime_type', 'image/%');
      } else if (typeFilter === 'video') {
        query = query.like('mime_type', 'video/%');
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'size-desc') {
        query = query.order('file_size', { ascending: false });
      } else if (sortBy === 'size-asc') {
        query = query.order('file_size', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      setMedia(data || []);
    } catch (err: any) {
      console.error('[Media Manager] Load error:', err);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const isMediaUsed = (item: MediaItem) => {
    if (usedUrls.has(item.file_url)) return true;
    return sectionsData.some(sec => {
      const settingsStr = sec.settings ? JSON.stringify(sec.settings) : '';
      const contentStr = sec.content_data ? JSON.stringify(sec.content_data) : '';
      return settingsStr.includes(item.file_url) || contentStr.includes(item.file_url);
    });
  };

  // 2. Upload Logic (WebM warnings + Compression via API Endpoint)
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(-1);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const executeActualUpload = async (taskId: string, file: File) => {
    try {
      setUploadTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'uploading', progress: 50 } : t
      ));

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

      const resData = await response.json();

      setUploadTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      ));

      toast.success(`"${file.name}" uploaded successfully!`);
      
      // Auto Vision details written if active
      if (resData.meta?.ai_generated) {
        toast.info(`Auto AI description added for: ${file.name}`);
      }

      // Re-fetch media
      fetchMedia();

      // Auto select newly uploaded file if in selector mode
      if (mode === 'selector') {
        setSelectedLibraryUrls(prev => {
          const next = multiple ? new Set(prev) : new Set<string>();
          next.add(resData.url);
          return next;
        });
      }
    } catch (err: any) {
      setUploadTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed', error: err.message || 'Upload failed' } : t
      ));
      toast.error(`"${file.name}" upload failed: ${err.message}`);
    }
  };

  const startUploadTask = async (task: UploadTask) => {
    const file = task.file;
    const taskId = task.id;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);

    if (isVideo) {
      // Check video duration limit (1 min = 60s)
      const duration = await getVideoDuration(file);
      if (duration > 60) {
        setUploadTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'failed', error: 'Exceeds 1-minute limit' } : t
        ));
        toast.error(`"${file.name}" is too long. Videos must be 1 minute or less.`);
        return;
      }

      // Check format recommendations
      const isWebm = file.name.toLowerCase().endsWith('.webm') || file.type === 'video/webm';
      if (!isWebm) {
        setPendingVideoUpload({ task, file });
        setUploadTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'failed', error: 'Waiting for format confirmation' } : t
        ));
        return;
      }
    }

    executeActualUpload(taskId, file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (mode === 'selector' && !multiple && files.length > 1) {
      toast.warning('Please select only one file.');
      return;
    }

    setUploading(true);
    const newTasks = files.map(file => {
      const id = `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      return {
        id,
        file,
        progress: 0,
        status: 'uploading' as const
      };
    });

    setUploadTasks(prev => [...prev, ...newTasks]);
    newTasks.forEach(task => startUploadTask(task));
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (e.target) e.target.value = '';
  };

  const handleCancelUpload = (taskId: string) => {
    setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' as const } : t));
  };

  const handleRetryUpload = (taskId: string) => {
    const task = uploadTasks.find(t => t.id === taskId);
    if (task) {
      startUploadTask(task);
    }
  };

  // 3. Selection Actions
  const toggleSelect = (item: MediaItem) => {
    if (mode === 'selector') {
      setSelectedLibraryUrls(prev => {
        const next = new Set(prev);
        if (next.has(item.file_url)) {
          next.delete(item.file_url);
        } else {
          if (!multiple) {
            next.clear();
          }
          next.add(item.file_url);
        }
        return next;
      });
    } else {
      setSelectedIds(prev => 
        prev.includes(item.id) ? prev.filter(selectedId => selectedId !== item.id) : [...prev, item.id]
      );
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMedia.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMedia.map(m => m.id));
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLibraryUrls.size === 0) {
      toast.warning('Please select at least one item.');
      return;
    }
    if (onSelect) {
      onSelect(Array.from(selectedLibraryUrls));
    }
    if (onClose) {
      onClose();
    }
  };

  // 4. Vision AI Operations (Only available in Management mode)
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

  const handleSingleGenerate = async (item: MediaItem) => {
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
          await new Promise(res => setTimeout(res, 600)); // Delay to respect limits
        } catch (e) {
          console.warn('[Media Bulk Vision] Skipped item:', item.original_filename, e);
        }
      }

      toast.success('Bulk vision metadata complete!', { id: toastId });
      setSelectedIds([]);
      fetchMedia();
    } catch (err) {
      toast.error('Bulk vision process failed');
    } finally {
      setBulkGenerating(false);
    }
  };

  // 5. Metadata Update & Delete Operations
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
      toast.success('Image details updated successfully');
      setEditingItem(null);
      fetchMedia();
    } catch (err) {
      toast.error('Failed to update image details');
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Delete this file from database and media storage?')) return;
    try {
      const supabase = createClient();
      await supabase.from('media_library').delete().eq('id', id);
      
      const filename = url.split('/').pop();
      if (filename) {
        await supabase.storage.from('product-images').remove([filename]);
      }

      toast.success('Media file deleted');
      fetchMedia();
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setSelectedLibraryUrls(prev => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  // Helper formats
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFilename = (url: string) => {
    return url.split('/').pop() || '';
  };

  // 6. Client Filter & Date Logic
  const filteredMedia = media.filter(item => {
    // Unused Media filter
    if (onlyUnused && isMediaUsed(item)) return false;

    // Date Filter
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (dateFilter === 'today') {
        if (itemDate < today) return false;
      } else if (dateFilter === 'yesterday') {
        const tomorrowOfYesterday = new Date(yesterday);
        tomorrowOfYesterday.setDate(tomorrowOfYesterday.getDate() + 1);
        if (itemDate < yesterday || itemDate >= tomorrowOfYesterday) return false;
      } else if (dateFilter === 'last_7') {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        if (itemDate < last7) return false;
      } else if (dateFilter === 'last_30') {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        if (itemDate < last30) return false;
      }
    }

    return true;
  });

  const totalCapacityBytes = 1024 * 1024 * 1024; // 1 GB limit
  const usedBytes = media.reduce((sum, item) => sum + (item.file_size || 0), 0);
  const usedPercentage = Math.min(100, (usedBytes / totalCapacityBytes) * 100);
  const isUploading = uploadTasks.some(t => t.status === 'uploading');

  return (
    <div className={`space-y-6 w-full ${mode === 'library' ? 'p-4 md:p-6 max-w-7xl mx-auto' : 'p-6 overflow-y-auto flex-1'}`}>
      
      {/* 1. Header (Only displayed on full Library Page) */}
      {mode === 'library' && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Media Library & Image SEO</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload files, view AI tags, edit alt texts, and trigger vision descriptions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
              >
                {bulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Bulk Vision AI ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold active:scale-95 disabled:bg-gray-100 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Upload Media</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* 2. Capacity & Vision AI Auto toggles (Hidden on selector modal) */}
      {mode === 'library' && (
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

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'generated', 'pending'] as const).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setAiFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border min-h-[38px] flex-1 md:flex-none capitalize transition-all cursor-pointer ${
                  aiFilter === status
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {status === 'all' ? 'All' : status === 'generated' ? 'AI Tagged' : 'Pending'}
              </button>
            ))}
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[38px] cursor-pointer"
            >
              {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Global capacity indicator (Visible on both) */}
      <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-700 dark:text-gray-300">Storage Usage:</span>
          <span>{formatBytes(usedBytes)} used of 1 GB ({usedPercentage.toFixed(2)}%)</span>
        </div>
        <div className="w-full sm:max-w-xs bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#e94560] h-full rounded-full transition-all duration-500" 
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
      </div>

      {/* 4. Unified Filtering and Sorting row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        
        {/* Left side: Search & Type */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search filenames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 dark:bg-[#1a1a30] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white min-h-[44px]"
            />
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-full sm:w-auto min-h-[44px] items-center">
            {(['all', 'image', 'video'] as const).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type === 'image' ? 'Images' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        {/* Right side: Upload (Selector mode only) & Sorting & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {mode === 'selector' && (
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-[#2e2e4e] dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors w-full sm:w-auto min-h-[44px]">
              <Upload className="h-4.5 w-4.5" />
              {isUploading ? 'Uploading...' : 'Upload Media'}
              <input
                type="file"
                multiple={multiple}
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="font-bold text-gray-500 dark:text-gray-400 text-xs">Date:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 min-h-[44px] cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-44 px-3.5 py-2 text-sm bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 min-h-[44px] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="size-desc">Size: Big to Small</option>
              <option value="size-asc">Size: Small to Big</option>
            </select>
          </div>

          {/* Unused filter (Visible on both) */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-800 rounded-xl p-2 bg-white dark:bg-[#16162a] min-h-[44px]">
            <input
              type="checkbox"
              checked={onlyUnused}
              onChange={e => setOnlyUnused(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span>Unused Only</span>
          </label>
        </div>
      </div>

      {/* 5. Uploading Tasks Queue (Visible on both during active upload processes) */}
      {uploadTasks.some(t => t.status !== 'completed' && t.status !== 'cancelled') && (
        <div className="bg-gray-55/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Upload Queue</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {uploadTasks
              .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
              .map(t => {
                const taskIsVideo = t.file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(t.file.name);
                return (
                  <div 
                    key={t.id} 
                    className="relative aspect-square rounded-xl overflow-hidden border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] flex flex-col items-center justify-center p-3 text-center"
                  >
                    <div className="text-gray-400 dark:text-gray-600 mb-1.5">
                      {taskIsVideo ? <Play className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full mb-1">
                      {t.file.name}
                    </span>
                    
                    {t.status === 'uploading' ? (
                      <div className="w-full flex flex-col items-center gap-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-[8px] font-bold text-gray-500">{t.progress}%</span>
                        <button
                          type="button"
                          onClick={() => handleCancelUpload(t.id)}
                          className="text-[8px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : t.status === 'failed' ? (
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-red-500 truncate w-full" title={t.error}>
                          {t.error || 'Failed'}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRetryUpload(t.id)}
                            className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[8px] font-bold cursor-pointer"
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelUpload(t.id)}
                            className="text-[8px] font-bold text-gray-400 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. Media Grid (Directly shared) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
          No media files found matching the search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = mode === 'selector' ? selectedLibraryUrls.has(item.file_url) : selectedIds.includes(item.id);
            const isGenerating = generatingId === item.id;
            const isVideo = item.mime_type?.startsWith('video/') || item.file_url.match(/\.(mp4|mov|webm)$/i);

            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer flex flex-col justify-end transition-all ${
                  isSelected 
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                
                {/* 1. Selector Indicators / Checkbox */}
                {mode === 'selector' ? (
                  isSelected && (
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center z-10">
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 left-3 h-4.5 w-4.5 text-blue-600 rounded border-gray-300 cursor-pointer z-10"
                  />
                )}

                {/* 2. Media content (Direct Video/Img tags with micro-interactions) */}
                {isVideo ? (
                  <>
                    <video
                      src={item.file_url}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      muted
                      playsInline
                      loop
                      onMouseOver={(e) => {
                        try {
                          e.currentTarget.play();
                        } catch (err) {}
                      }}
                      onMouseOut={(e) => {
                        try {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        } catch (err) {}
                      }}
                    />
                    <div className="absolute bottom-3 left-3 z-10 bg-black/60 px-1.5 py-0.5 rounded text-white text-[8px] font-bold tracking-wider">
                      VIDEO
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="p-1 rounded-full bg-black/50 text-white">
                        <Play className="h-4 w-4 fill-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.file_url}
                    alt={item.alt_text}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}

                {/* 3. AI tag badge (Only in library mode) */}
                {mode === 'library' && (
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
                )}

                {/* 4. Actions hover overlay (Refactored conditional options) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-10">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.file_url); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Only show metadata details and AI trigger in Library mode */}
                    {mode === 'library' && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer min-h-[32px]"
                          title="Edit metadata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.file_url); }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-all cursor-pointer min-h-[32px]"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-white font-mono line-clamp-1 w-full bg-black/40 p-1 rounded flex justify-between">
                      <span className="truncate mr-1">Alt: {item.alt_text || 'None'}</span>
                      <span className="flex-shrink-0 text-gray-300">{formatBytes(item.file_size)}</span>
                    </div>

                    {mode === 'library' && !isVideo && (
                      <button
                        type="button"
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Modal Confirmation Footer (Only visible on selector modal) */}
      {mode === 'selector' && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/30 dark:bg-gray-900/10 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSelection}
            disabled={selectedLibraryUrls.size === 0}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#2e2e4e] dark:hover:bg-[#d8344e] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add Selected ({selectedLibraryUrls.size})
          </button>
        </div>
      )}

      {/* 8. Editing Metadata Form Modal (Only triggerable in Library mode) */}
      {mode === 'library' && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Edit Image Metadata</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]">
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

      {/* 9. WebM warning overlay (Shared modal for format recommendations) */}
      {pendingVideoUpload && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Play className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">WebM Format Recommended</h3>
            </div>
            <div className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              <p>
                We highly recommend converting non-WebM videos (like <strong className="text-gray-905 dark:text-white">{pendingVideoUpload.file.name.split('.').pop()?.toUpperCase()}</strong>) to <strong className="text-[#e94560]">WebM format</strong> before uploading.
              </p>
              <p>
                WebM is standard for e-commerce because it compresses video size dramatically, making your store load up to **5x faster** on mobile networks and reducing customer load times.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.open('https://www.google.com/search?q=video+to+webm+converter', '_blank');
                  handleCancelUpload(pendingVideoUpload.task.id);
                  setPendingVideoUpload(null);
                }}
                className="w-full py-2.5 bg-[#e94560] hover:bg-[#d8344e] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Convert to WebM (Recommended)
              </button>
              <button
                type="button"
                onClick={() => {
                  executeActualUpload(pendingVideoUpload.task.id, pendingVideoUpload.file);
                  setPendingVideoUpload(null);
                }}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Upload Original Anyway
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCancelUpload(pendingVideoUpload.task.id);
                  setPendingVideoUpload(null);
                }}
                className="w-full py-2 text-gray-400 hover:text-gray-500 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Cancel Upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
