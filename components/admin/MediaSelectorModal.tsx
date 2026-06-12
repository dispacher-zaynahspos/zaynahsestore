'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Upload, Image as ImageIcon, Check, Play } from '@/components/common/Icons';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/uploadImage';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  xhr?: XMLHttpRequest;
}

export default function MediaSelectorModal({ isOpen, onClose, onSelect, multiple = false }: MediaSelectorModalProps) {
  const [libraryImages, setLibraryImages] = useState<{ id: string; url: string; alt?: string; productName?: string; size: number; mimeType: string; createdAt: string }[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  
  // Search & Filter States
  const [librarySearch, setLibrarySearch] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc'>('date_desc');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last_7' | 'last_30'>('all');
  const [onlyUnused, setOnlyUnused] = useState(false);

  // Upload Queue State
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

  // Usage Cross-Reference States
  const [usedUrls, setUsedUrls] = useState<Set<string>>(new Set());
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<Set<string>>(new Set());
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [pendingVideoUpload, setPendingVideoUpload] = useState<{ task: UploadTask; file: File } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLibraryImages();
      setSelectedLibraryUrls(new Set());
      setUploadTasks([]);
    }
  }, [isOpen]);

  const loadLibraryImages = async () => {
    try {
      setLoadingLibrary(true);
      const supabase = createClient();
      
      const { data: imagesData, error } = await supabase
        .from('product_images')
        .select('id, url, alt, size, mime_type, created_at, product_id, products ( name )')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const [cats, variants, sizeGuides, settings, sections] = await Promise.all([
        supabase.from('categories').select('image_url'),
        supabase.from('product_variants').select('image_url'),
        supabase.from('size_guides').select('image_url'),
        supabase.from('store_settings').select('logo_url, favicon_url, banner_url, exit_intent_image_url').single(),
        supabase.from('homepage_sections').select('settings, content_data')
      ]);

      const inUse = new Set<string>();
      cats.data?.forEach(c => c.image_url && inUse.add(c.image_url));
      variants.data?.forEach(v => v.image_url && inUse.add(v.image_url));
      sizeGuides.data?.forEach(sg => sg.image_url && inUse.add(sg.image_url));
      if (settings.data) {
        const s = settings.data;
        if (s.logo_url) inUse.add(s.logo_url);
        if (s.favicon_url) inUse.add(s.favicon_url);
        if (s.banner_url) inUse.add(s.banner_url);
        if (s.exit_intent_image_url) inUse.add(s.exit_intent_image_url);
      }
      
      imagesData?.forEach((img: any) => {
        if (img.product_id) {
          inUse.add(img.url);
        }
      });

      setUsedUrls(inUse);
      setSectionsData(sections.data || []);

      const uniqueItems: any[] = [];
      const seenUrls = new Set();
      imagesData?.forEach((img: any) => {
        if (!seenUrls.has(img.url)) {
          seenUrls.add(img.url);
          uniqueItems.push({
            id: img.id,
            url: img.url,
            alt: img.alt,
            productName: img.products?.name,
            size: img.size || (img.url.match(/\.(mp4|mov|webm)$/i) ? 5242880 : 46080),
            mimeType: img.mime_type || (img.url.match(/\.(mp4|mov|webm)$/i) ? 'video/mp4' : 'image/webp'),
            createdAt: img.created_at,
          });
        }
      });
      
      setLibraryImages(uniqueItems);
    } catch (err: any) {
      console.error('Failed to load library:', err);
      toast.error('Failed to load media library');
    } finally {
      setLoadingLibrary(false);
    }
  };

  const isMediaUsed = (item: any) => {
    if (usedUrls.has(item.url)) return true;
    return sectionsData.some(sec => {
      const settingsStr = sec.settings ? JSON.stringify(sec.settings) : '';
      const contentStr = sec.content_data ? JSON.stringify(sec.content_data) : '';
      return settingsStr.includes(item.url) || contentStr.includes(item.url);
    });
  };

  const toggleSelectLibraryUrl = (url: string) => {
    setSelectedLibraryUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(url);
      }
      return next;
    });
  };

  // Helper to load video metadata and read duration
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

      const publicUrl = await uploadImage(file, 'product-images');

      const supabase = createClient();
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);
      const ext = isVideo ? (file.name.split('.').pop() || 'mp4') : 'webp';

      const { data, error } = await supabase
        .from('product_images')
        .insert({
          url: publicUrl,
          alt: file.name,
          product_id: null,
          size: file.size,
          mime_type: file.type || (isVideo ? `video/${ext}` : 'image/webp')
        })
        .select('*');

      if (error) throw error;

      setUploadTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      ));

      const newItem = {
        id: data?.[0]?.id || `new_${Date.now()}`,
        url: publicUrl,
        alt: file.name,
        size: file.size,
        mimeType: file.type || (isVideo ? `video/${ext}` : 'image/webp'),
        createdAt: data?.[0]?.created_at || new Date().toISOString()
      };

      setLibraryImages(prev => [newItem, ...prev]);
      setSelectedLibraryUrls(prev => {
        const next = multiple ? new Set(prev) : new Set<string>();
        next.add(publicUrl);
        return next;
      });
    } catch (err: any) {
      setUploadTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'failed', error: err.message || 'Upload failed' } : t
      ));
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
        // Show popup warning
        setPendingVideoUpload({ task, file });
        // Set status to failed temporarily so it doesn't show loading spinner, or keep it idle
        setUploadTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: 'failed', error: 'Waiting for format confirmation' } : t
        ));
        return;
      }
    }

    executeActualUpload(taskId, file);
  };

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.warning('Please select only one file.');
      return;
    }

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
    
    if (e.target) e.target.value = '';
  };

  const handleCancelUpload = (taskId: string) => {
    setUploadTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task?.xhr) {
        task.xhr.abort();
      }
      return prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' as const } : t);
    });
  };

  const handleRetryUpload = (taskId: string) => {
    const task = uploadTasks.find(t => t.id === taskId);
    if (task) {
      startUploadTask(task);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLibraryUrls.size === 0) {
      toast.warning('Please select at least one item.');
      return;
    }
    onSelect(Array.from(selectedLibraryUrls));
    onClose();
  };

  const getFilename = (url: string) => {
    return url.split('/').pop() || '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Capacity calculations
  const totalCapacityBytes = 1024 * 1024 * 1024; // 1 GB
  const usedBytes = libraryImages.reduce((sum, item) => sum + (item.size || 0), 0);
  const usedPercentage = Math.min(100, (usedBytes / totalCapacityBytes) * 100);
  const isUploading = uploadTasks.some(t => t.status === 'uploading');

  const sortedAndFilteredImages = libraryImages
    .filter(item => {
      if (librarySearch) {
        const term = librarySearch.toLowerCase();
        const matchesSearch = 
          (item.alt || '').toLowerCase().includes(term) ||
          (item.productName || '').toLowerCase().includes(term) ||
          (item.url || '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      if (mediaTypeFilter !== 'all') {
        const isVideo = item.mimeType?.startsWith('video/') || item.url.match(/\.(mp4|mov|webm)$/i);
        if (mediaTypeFilter === 'video' && !isVideo) return false;
        if (mediaTypeFilter === 'image' && isVideo) return false;
      }

      if (dateFilter !== 'all') {
        const itemDate = new Date(item.createdAt);
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

      if (onlyUnused) {
        if (isMediaUsed(item)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') {
        const nameA = (a.alt || getFilename(a.url)).toLowerCase();
        const nameB = (b.alt || getFilename(b.url)).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name_desc') {
        const nameA = (a.alt || getFilename(a.url)).toLowerCase();
        const nameB = (b.alt || getFilename(b.url)).toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'size_desc') {
        return (b.size || 0) - (a.size || 0);
      }
      if (sortBy === 'size_asc') {
        return (a.size || 0) - (b.size || 0);
      }
      return 0;
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overscroll-contain">
      <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Media Library</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {multiple ? 'Select images or videos to add' : 'Select an image or video'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Capacity Bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="font-bold text-gray-700 dark:text-gray-300">Storage Usage:</span>
            <span>{formatBytes(usedBytes)} used of 1 GB ({usedPercentage.toFixed(2)}%)</span>
          </div>
          <div className="w-full sm:max-w-xs bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#e94560] h-full rounded-full transition-all duration-500" 
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
        </div>

        {/* Modal Controls (Search & Filters) */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 bg-gray-50/50 dark:bg-gray-900/10">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search library..."
                value={librarySearch}
                onChange={e => setLibrarySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#16162a] text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-[#2e2e4e] dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors w-full sm:w-auto">
                <Upload className="h-4.5 w-4.5" />
                {isUploading ? 'Uploading...' : 'Upload to Library'}
                <input
                  type="file"
                  multiple={multiple}
                  accept="image/*,video/*"
                  onChange={handleModalImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-500 dark:text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-2 py-1 focus:outline-none focus:border-[#e94560] text-gray-700 dark:text-gray-300"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Large to Small)</option>
                <option value="size_asc">Size (Small to Large)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-500 dark:text-gray-400">Date:</span>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-2 py-1 focus:outline-none focus:border-[#e94560] text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7">Last 7 Days</option>
                <option value="last_30">Last 30 Days</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-500 dark:text-gray-400">Type:</span>
              <select
                value={mediaTypeFilter}
                onChange={e => setMediaTypeFilter(e.target.value as any)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-2 py-1 focus:outline-none focus:border-[#e94560] text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Media</option>
                <option value="image">Images Only</option>
                <option value="video">Videos Only</option>
              </select>
            </div>

            {/* Unused toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 dark:text-gray-300 ml-auto">
              <input
                type="checkbox"
                checked={onlyUnused}
                onChange={e => setOnlyUnused(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
              <span className="font-bold">Unused Media Only</span>
            </label>
          </div>
        </div>

        {/* Modal Grid of Media */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px] overscroll-contain">
          {loadingLibrary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (sortedAndFilteredImages.length === 0 && uploadTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                No items found matching filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {/* Render Active Upload Tasks */}
              {uploadTasks
                .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
                .map(t => {
                  const taskIsVideo = t.file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(t.file.name);
                  return (
                    <div 
                      key={t.id} 
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-[#e94560]/40 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex flex-col items-center justify-center p-3 text-center transition-all"
                    >
                      <div className="text-gray-400 dark:text-gray-600 mb-2">
                        {taskIsVideo ? <Play className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate max-w-full mb-1">
                        {t.file.name}
                      </span>
                      
                      {t.status === 'uploading' ? (
                        <div className="w-full px-2 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#e94560] h-full transition-all duration-300" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{t.progress}%</span>
                          <button
                            type="button"
                            onClick={() => handleCancelUpload(t.id)}
                            className="text-[9px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider mt-0.5 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : t.status === 'failed' ? (
                        <div className="w-full px-2 flex flex-col items-center gap-1.5">
                          <span className="text-[9px] font-bold text-red-500 line-clamp-1 w-full" title={t.error}>
                            {t.error || 'Failed'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRetryUpload(t.id)}
                              className="px-2 py-0.5 rounded bg-[#e94560] text-white text-[8px] font-bold hover:bg-[#d8344e] transition-colors cursor-pointer"
                            >
                              Retry
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelUpload(t.id)}
                              className="text-[8px] font-bold text-gray-400 hover:text-gray-500 transition-colors uppercase cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}

              {/* Render Existing Media Library Items */}
              {sortedAndFilteredImages.map(item => {
                const isSelected = selectedLibraryUrls.has(item.url);
                const isVideo = item.mimeType?.startsWith('video/') || item.url.match(/\.(mp4|mov|webm)$/i);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectLibraryUrl(item.url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#e94560] ring-2 ring-[#e94560]/30'
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={item.url}
                          muted
                          playsInline
                          loop
                          className="absolute inset-0 w-full h-full object-cover"
                          onMouseEnter={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-bold tracking-wider">
                          VIDEO
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="p-1 rounded-full bg-black/50 text-white">
                            <Play className="h-4.5 w-4.5 fill-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.alt || 'Library Image'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    {/* Selected Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#e94560]/20 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-[#e94560] flex items-center justify-center shadow-lg">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Name & Metadata Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-semibold text-white truncate">
                        {item.alt || getFilename(item.url)}
                      </p>
                      <div className="flex items-center justify-between text-[8px] text-gray-300 mt-0.5">
                        <span>{formatBytes(item.size)}</span>
                        {item.productName && <span className="truncate max-w-[50%]">{item.productName}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/30 dark:bg-gray-900/10">
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

      </div>

      {/* WebM Warning Modal Overlay */}
      {pendingVideoUpload && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all scale-up space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Play className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">WebM Format Recommended</h3>
            </div>
            <div className="space-y-2 text-xs leading-relaxed text-gray-650 dark:text-gray-400">
              <p>
                We highly recommend converting non-WebM videos (like <strong className="text-gray-900 dark:text-white">{pendingVideoUpload.file.name.split('.').pop()?.toUpperCase()}</strong>) to <strong className="text-[#e94560]">WebM format</strong> before uploading.
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
                className="w-full py-2 text-gray-400 hover:text-gray-505 font-bold text-xs text-center transition-colors cursor-pointer"
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
