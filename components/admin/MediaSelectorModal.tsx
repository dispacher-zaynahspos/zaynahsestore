'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Upload, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { uploadProductImage } from '@/lib/services/storage';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaSelectorModal({ isOpen, onClose, onSelect, multiple = false }: MediaSelectorModalProps) {
  const [libraryImages, setLibraryImages] = useState<{ id: string; url: string; alt?: string; productName?: string }[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedLibraryUrls, setSelectedLibraryUrls] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLibraryImages();
      setSelectedLibraryUrls(new Set());
    }
  }, [isOpen]);

  const loadLibraryImages = async () => {
    try {
      setLoadingLibrary(true);
      const supabase = createClient();
      const { data: imagesData, error } = await supabase
        .from('product_images')
        .select('id, url, alt, products ( name )')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by unique URLs
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

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.warning('Please select only one image.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading to library...');
    try {
      const supabase = createClient();
      const newImages = await Promise.all(
        files.map(async (file) => {
          const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          const url = await uploadProductImage(file, tempId);
          
          const { data, error } = await supabase
            .from('product_images')
            .insert({
              url,
              alt: file.name,
              product_id: null,
            })
            .select('id');

          if (error) throw error;
          return { id: data?.[0]?.id || tempId, url, file };
        })
      );
      
      const addedItems = newImages.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.file.name,
      }));

      setLibraryImages(prev => [...addedItems, ...prev]);
      
      setSelectedLibraryUrls(prev => {
        const next = multiple ? new Set(prev) : new Set<string>();
        newImages.forEach(img => next.add(img.url));
        return next;
      });

      toast.success('Images uploaded successfully', { id: toastId });
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to upload images';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLibraryUrls.size === 0) {
      toast.warning('Please select at least one image.');
      return;
    }
    onSelect(Array.from(selectedLibraryUrls));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overscroll-contain">
      <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Media Library</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {multiple ? 'Select images to add' : 'Select an image'}
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

        {/* Modal Controls (Search & Upload) */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
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
              {uploading ? 'Uploading...' : 'Upload to Library'}
              <input
                type="file"
                multiple={multiple}
                accept="image/*"
                onChange={handleModalImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Modal Grid of Images */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px] overscroll-contain">
          {loadingLibrary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : libraryImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                No images found in Media Library
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {libraryImages
                .filter(item => {
                  if (!librarySearch) return true;
                  const term = librarySearch.toLowerCase();
                  return (
                    (item.alt || '').toLowerCase().includes(term) ||
                    (item.productName || '').toLowerCase().includes(term) ||
                    (item.url || '').toLowerCase().includes(term)
                  );
                })
                .map(item => {
                  const isSelected = selectedLibraryUrls.has(item.url);
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt || 'Library Image'}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Selected Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#e94560]/20 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-[#e94560] flex items-center justify-center shadow-lg">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Name Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-semibold text-white truncate">
                          {item.alt || item.url.split('/').pop()}
                        </p>
                        {item.productName && (
                          <p className="text-[9px] text-gray-300 truncate">
                            {item.productName}
                          </p>
                        )}
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
    </div>
  );
}
