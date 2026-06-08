'use client';

import React, { useState, useTransition, useMemo, useEffect } from 'react';
import { Product, Category, StoreSettings, Review, HomepageSection } from '@/lib/types';
import { 
  Plus, Trash2, ChevronUp, ChevronDown, Smartphone, Monitor, GripVertical, Settings, Check, RefreshCw, Eye, EyeOff, Lock
} from '@/components/common/Icons';
import { 
  updateHomepageSection, 
  reorderHomepageSections, 
  addHomepageSection, 
  deleteHomepageSection 
} from '@/lib/services/sections';
import { uploadProductImage } from '@/lib/services/storage';
import { toast } from 'sonner';
import MediaSelectorModal from './MediaSelectorModal';
import StoreFront from '@/components/store/StoreFront';

interface CustomizerEditorProps {
  initialSections: HomepageSection[];
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  reviews?: Review[];
}

export default function CustomizerEditor({
  initialSections,
  products,
  categories,
  settings,
  reviews = []
}: CustomizerEditorProps) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSections.length > 0 ? initialSections[0].id : null
  );
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('mobile');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ready') {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'sync',
            sections,
            settings
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleReady);
    
    // Also try syncing directly on change
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'sync',
        sections,
        settings
      }, '*');
    }

    return () => window.removeEventListener('message', handleReady);
  }, [sections, settings]);

  // Active section helper
  const activeSection = useMemo(() => {
    return sections.find(s => s.id === activeSectionId) || null;
  }, [sections, activeSectionId]);

  // Handle section value changes
  const handleUpdateSection = (id: string, updates: Partial<HomepageSection>) => {
    setSections(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          settings: { ...s.settings, ...(updates.settings || {}) },
          content_data: { ...s.content_data, ...(updates.content_data || {}) }
        };
      }
      return s;
    }));
  };

  // Reorder sections
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSections = [...sections];
    
    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate sort orders
    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      sort_order: idx + 1
    }));

    setSections(reordered);
  };

  // Delete section
  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    startTransition(async () => {
      try {
        await deleteHomepageSection(id);
        setSections(prev => prev.filter(s => s.id !== id));
        if (activeSectionId === id) {
          setActiveSectionId(sections.length > 1 ? sections.find(s => s.id !== id)?.id || null : null);
        }
        toast.success('Section deleted successfully');
      } catch (err) {
        toast.error('Failed to delete section');
      }
    });
  };

  // Add new section
  const handleAddSection = async (type: string) => {
    const defaultTitles: Record<string, string> = {
      hero_banner: 'Promo Slider',
      product_grid: 'Featured Products',
      category_list: 'Shop By Category',
      category_grid: 'Featured Collection Highlights',
      promo_banner: 'Limited Time Deal',
      trust_badges: 'Our Promises',
      recent_reviews: 'Customer Reviews',
      brands_logos: 'Our Premium Partners'
    };

    startTransition(async () => {
      try {
        const newSec = await addHomepageSection(type, defaultTitles[type] || 'New Section');
        setSections(prev => [...prev, newSec]);
        setActiveSectionId(newSec.id);
        toast.success('Section added successfully');
      } catch (err) {
        toast.error('Failed to add section');
      }
    });
  };

  // Media Selector State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaUploadTarget, setMediaUploadTarget] = useState<{
    sectionId: string;
    fieldPath: 'settings' | 'content_data';
    fieldKey: string;
    isGridItem?: boolean;
    gridIndex?: number;
  } | null>(null);

  const handleMediaSelected = (urls: string[]) => {
    if (urls.length === 0 || !mediaUploadTarget) return;
    const url = urls[0];
    const { sectionId, fieldPath, fieldKey, isGridItem, gridIndex } = mediaUploadTarget;

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    if (isGridItem && gridIndex !== undefined) {
      const items = section.content_data?.items || [];
      const updatedItems = [...items];
      updatedItems[gridIndex] = { ...updatedItems[gridIndex], [fieldKey]: url };
      handleUpdateSection(sectionId, { content_data: { items: updatedItems } });
    } else {
      const updates: Partial<HomepageSection> = {};
      if (fieldPath === 'settings') {
        updates.settings = { ...section.settings, [fieldKey]: url };
      } else {
        updates.content_data = { ...section.content_data, [fieldKey]: url };
      }
      handleUpdateSection(sectionId, updates);
    }
  };

  // Save layout state to db
  const handleSaveLayout = () => {
    startTransition(async () => {
      try {
        // 1. Save sort order
        const orderPayload = sections.map((s, idx) => ({ id: s.id, sort_order: idx + 1 }));
        await reorderHomepageSections(orderPayload);

        // 2. Update individual sections settings/content
        const updatePromises = sections.map(sec => 
          updateHomepageSection(sec.id, {
            title: sec.title,
            active: sec.active,
            settings: sec.settings,
            content_data: sec.content_data
          })
        );

        await Promise.all(updatePromises);
        toast.success('Homepage layout saved successfully');
      } catch (err) {
        toast.error('Failed to save layout adjustments');
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* LEFT SIDEBAR: Sections List & Settings Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm h-full">
        {/* Header toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/2 bg-surface-2">
          <h3 className="font-extrabold text-sm tracking-wide text-gray-900 dark:text-white uppercase">
            Customizer Sections
          </h3>
          <button
            onClick={handleSaveLayout}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e94560] hover:bg-[#d83550] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save Layout
          </button>
        </div>

        {/* Section Actions & List Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Add section widget */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              + Add Layout Section
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'hero_banner', label: 'Promo Slider' },
                { type: 'product_grid', label: 'Product Grid' },
                { type: 'category_list', label: 'Category Filter' },
                { type: 'category_grid', label: 'Category Grid' },
                { type: 'promo_banner', label: 'Promo Banner' },
                { type: 'trust_badges', label: 'Trust Badges' },
                { type: 'recent_reviews', label: 'Reviews Feed' },
                { type: 'brands_logos', label: 'Brands Slider' },
                { type: 'social_feed', label: 'Social Feed' }
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => handleAddSection(item.type)}
                  className="px-3 py-2 text-left bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-gray-800/80 hover:border-[#e94560] dark:hover:border-[#e94560] text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all active:scale-97 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Stack */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              Section Layout Order
            </label>
            
            {sections.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold text-gray-400">
                No custom sections added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section, idx) => {
                  const isActive = activeSectionId === section.id;
                  return (
                    <div
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-350 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {section.title || section.section_type}
                          </div>
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                            {section.section_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdateSection(section.id, { active: !section.active })}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 ${
                            section.active ? 'text-[#e94560]' : 'text-gray-400'
                          } cursor-pointer`}
                          title={section.active ? 'Hide layout' : 'Show layout'}
                        >
                          {section.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Customizer inputs */}
          {activeSection && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-5 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                <Settings className="h-4 w-4 text-[#e94560]" />
                Section Properties
              </div>

              {/* Title parameter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  Section Title
                </label>
                <input
                  type="text"
                  value={activeSection.title || ''}
                  onChange={e => handleUpdateSection(activeSection.id, { title: e.target.value })}
                  placeholder="e.g. Featured Collection"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>

              {/* Specific inputs for hero_banner */}
              {activeSection.section_type === 'hero_banner' && (
                <div className="space-y-4">
                  {/* Banner Images (Desktop & Mobile) */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Images</span>
                    
                    {/* Desktop Image */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Desktop Banner Image *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activeSection.content_data?.image_url || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { image_url: e.target.value } })}
                          placeholder="Desktop Image URL"
                          className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaUploadTarget({ sectionId: activeSection.id, fieldPath: 'content_data', fieldKey: 'image_url' });
                            setIsMediaModalOpen(true);
                          }}
                          className="px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 hover:dark:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          Select
                        </button>
                      </div>
                    </div>

                    {/* Mobile Image */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Mobile Banner Image (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activeSection.content_data?.mobile_image_url || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { mobile_image_url: e.target.value } })}
                          placeholder="Mobile Image URL (falls back to desktop)"
                          className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaUploadTarget({ sectionId: activeSection.id, fieldPath: 'content_data', fieldKey: 'mobile_image_url' });
                            setIsMediaModalOpen(true);
                          }}
                          className="px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 hover:dark:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Banner Heights & Widths */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Dimensions</span>
                    
                    {/* Heights */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Height (Desktop)
                        </label>
                        <input
                          type="text"
                          value={activeSection.settings?.height_desktop || '450px'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { height_desktop: e.target.value } })}
                          placeholder="e.g. 450px or 60vh"
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Height (Mobile)
                        </label>
                        <input
                          type="text"
                          value={activeSection.settings?.height_mobile || '250px'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { height_mobile: e.target.value } })}
                          placeholder="e.g. 250px or 40vh"
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Widths */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Content Width (Desktop)
                        </label>
                        <input
                          type="text"
                          value={activeSection.settings?.content_width_desktop || '576px'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { content_width_desktop: e.target.value } })}
                          placeholder="e.g. 576px or 50%"
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Content Width (Mobile)
                        </label>
                        <input
                          type="text"
                          value={activeSection.settings?.content_width_mobile || '100%'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { content_width_mobile: e.target.value } })}
                          placeholder="e.g. 100% or 320px"
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Positioning & Alignments */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Layout & Alignments</span>
                    
                    {/* Desktop Content Box Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Desktop Pos (Horizontal)
                        </label>
                        <select
                          value={activeSection.settings?.content_position_desktop_x || activeSection.settings?.content_position_desktop || 'center'}
                          onChange={e => handleUpdateSection(activeSection.id, { 
                            settings: { 
                              content_position_desktop_x: e.target.value,
                              content_position_desktop: e.target.value // Legacy sync
                            } 
                          })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Desktop Pos (Vertical)
                        </label>
                        <select
                          value={activeSection.settings?.content_position_desktop_y || 'middle'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { content_position_desktop_y: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>

                    {/* Mobile Content Box Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Mobile Pos (Horizontal)
                        </label>
                        <select
                          value={activeSection.settings?.content_position_mobile_x || 'center'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { content_position_mobile_x: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Mobile Pos (Vertical)
                        </label>
                        <select
                          value={activeSection.settings?.content_position_mobile_y || 'middle'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { content_position_mobile_y: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
                        >
                          <option value="top">Top</option>
                          <option value="middle">Middle</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>

                    {/* Text alignment options */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Text Align (Desktop)
                        </label>
                        <select
                          value={activeSection.settings?.text_align_desktop || 'center'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { text_align_desktop: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Text Align (Mobile)
                        </label>
                        <select
                          value={activeSection.settings?.text_align_mobile || 'center'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { text_align_mobile: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    {/* Show Backdrop Container */}
                    <label className="flex items-center gap-2.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={activeSection.settings?.show_backdrop_container ?? false}
                        onChange={e => handleUpdateSection(activeSection.id, { settings: { show_backdrop_container: e.target.checked } })}
                        className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-gray-750 dark:text-gray-300">
                        Show Backdrop Box on Desktop (Glassmorphism)
                      </span>
                    </label>
                  </div>

                  {/* Image Scaling and Focal Crop Offset Shifts (Focal Points) */}
                  <div className="space-y-3.5 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Image Scaling & Position Shift</span>
                    
                    {/* Desktop Scaling & Focal Shifts */}
                    <div className="space-y-2 pb-2 border-b border-gray-200/50 dark:border-gray-800/50">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Desktop Viewport</span>
                      
                      {/* Desktop Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Scale (Zoom)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_scale_desktop ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          step="5"
                          value={activeSection.settings?.image_scale_desktop ?? 100}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_scale_desktop: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>

                      {/* Desktop Shift X (Left / Right) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Left / Right Shift (X Offset)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_focal_x_desktop ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={activeSection.settings?.image_focal_x_desktop ?? 50}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_focal_x_desktop: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>

                      {/* Desktop Shift Y (Up / Down) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Up / Down Shift (Y Offset)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_focal_y_desktop ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={activeSection.settings?.image_focal_y_desktop ?? 50}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_focal_y_desktop: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>
                    </div>

                    {/* Mobile Scaling & Focal Shifts */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Mobile Viewport</span>
                      
                      {/* Mobile Scale */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Scale (Zoom)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_scale_mobile ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          step="5"
                          value={activeSection.settings?.image_scale_mobile ?? 100}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_scale_mobile: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>

                      {/* Mobile Shift X (Left / Right) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Left / Right Shift (X Offset)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_focal_x_mobile ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={activeSection.settings?.image_focal_x_mobile ?? 50}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_focal_x_mobile: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>

                      {/* Mobile Shift Y (Up / Down) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Up / Down Shift (Y Offset)</span>
                          <span className="text-[#e94560]">{activeSection.settings?.image_focal_y_mobile ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={activeSection.settings?.image_focal_y_mobile ?? 50}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { image_focal_y_mobile: parseInt(e.target.value) } })}
                          className="w-full accent-[#e94560]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Overlays & Opacity */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Visual Styling & Colors</span>
                    
                    {/* Overlay Color */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Overlay Overlay Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={activeSection.settings?.overlay_color || '#000000'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { overlay_color: e.target.value } })}
                          className="h-8 w-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={activeSection.settings?.overlay_color || '#000000'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { overlay_color: e.target.value } })}
                          placeholder="#000000"
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Overlay Opacity */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Overlay Opacity
                        </label>
                        <span className="text-xs font-bold text-[#e94560]">
                          {Math.round((activeSection.settings?.overlay_opacity ?? 0.3) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={activeSection.settings?.overlay_opacity ?? 0.3}
                        onChange={e => handleUpdateSection(activeSection.id, { settings: { overlay_opacity: parseFloat(e.target.value) } })}
                        className="w-full accent-[#e94560]"
                      />
                    </div>

                    {/* Heading, Tagline and Subtitle text color overrides */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">Heading Color</label>
                        <input
                          type="text"
                          value={activeSection.settings?.heading_color || '#ffffff'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { heading_color: e.target.value } })}
                          placeholder="#ffffff"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">Subtitle Color</label>
                        <input
                          type="text"
                          value={activeSection.settings?.subtitle_color || '#e0e0e0'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { subtitle_color: e.target.value } })}
                          placeholder="#e0e0e0"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-semibold text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Texts Customizer */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Text Customizer</span>
                    
                    {/* Tagline / Small text */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Tagline / Supertitle Text
                      </label>
                      <input
                        type="text"
                        value={activeSection.content_data?.tagline || ''}
                        onChange={e => handleUpdateSection(activeSection.id, { content_data: { tagline: e.target.value } })}
                        placeholder="e.g. SUMMER ARRIVALS"
                        className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Subtitle Text
                      </label>
                      <textarea
                        rows={2}
                        value={activeSection.content_data?.subtitle || ''}
                        onChange={e => handleUpdateSection(activeSection.id, { content_data: { subtitle: e.target.value } })}
                        placeholder="e.g. Special discounts up to 50% on all luxury clothing"
                        className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
                      />
                    </div>

                    {/* Desktop Heading Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Heading Size (Desktop)
                        </label>
                        <select
                          value={activeSection.settings?.heading_size_desktop || '5xl'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { heading_size_desktop: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        >
                          <option value="2xl">Small (2xl)</option>
                          <option value="3xl">Medium (3xl)</option>
                          <option value="4xl">Large (4xl)</option>
                          <option value="5xl">X-Large (5xl)</option>
                          <option value="6xl">XX-Large (6xl)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          Heading Size (Mobile)
                        </label>
                        <select
                          value={activeSection.settings?.heading_size_mobile || '2xl'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { heading_size_mobile: e.target.value } })}
                          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                        >
                          <option value="lg">Small (lg)</option>
                          <option value="xl">Medium (xl)</option>
                          <option value="2xl">Large (2xl)</option>
                          <option value="3xl">X-Large (3xl)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Customizer (Shopify Multi-CTA Support) */}
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Call to Action Buttons</span>
                    
                    {/* Primary Button */}
                    <div className="space-y-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Primary Button</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={activeSection.content_data?.button_text || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { button_text: e.target.value } })}
                          placeholder="Label (Shop Now)"
                          className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={activeSection.content_data?.button_link || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { button_link: e.target.value } })}
                          placeholder="Link (/shop)"
                          className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Secondary Button (Optional)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={activeSection.content_data?.button_secondary_text || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { button_secondary_text: e.target.value } })}
                          placeholder="Label (e.g. Learn More)"
                          className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={activeSection.content_data?.button_secondary_link || ''}
                          onChange={e => handleUpdateSection(activeSection.id, { content_data: { button_secondary_link: e.target.value } })}
                          placeholder="Link (/about)"
                          className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specific inputs for product_grid */}
              {activeSection.section_type === 'product_grid' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Product Source
                    </label>
                    <select
                      value={activeSection.settings?.source || 'all'}
                      onChange={e => handleUpdateSection(activeSection.id, { settings: { source: e.target.value } })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    >
                      <option value="all">All Products</option>
                      <option value="featured">Featured Products Only</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          Category: {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Product Limit
                      </label>
                      <span className="text-xs font-bold text-[#e94560]">
                        {activeSection.settings?.limit || 8}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="24"
                      step="2"
                      value={activeSection.settings?.limit || 8}
                      onChange={e => handleUpdateSection(activeSection.id, { settings: { limit: parseInt(e.target.value) } })}
                      className="w-full accent-[#e94560]"
                    />
                  </div>
                </div>
              )}

              {/* Specific inputs for category_list */}
              {activeSection.section_type === 'category_list' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Cols Mobile
                    </label>
                    <select
                      value={activeSection.settings?.columns_mobile || 3}
                      onChange={e => handleUpdateSection(activeSection.id, { settings: { columns_mobile: parseInt(e.target.value) } })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    >
                      <option value="2">2 Columns</option>
                      <option value="3">3 Columns</option>
                      <option value="4">4 Columns</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Cols Desktop
                    </label>
                    <select
                      value={activeSection.settings?.columns_desktop || 6}
                      onChange={e => handleUpdateSection(activeSection.id, { settings: { columns_desktop: parseInt(e.target.value) } })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    >
                      <option value="3">3 Columns</option>
                      <option value="4">4 Columns</option>
                      <option value="6">6 Columns</option>
                      <option value="8">8 Columns</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Specific inputs for promo_banner */}
              {activeSection.section_type === 'promo_banner' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Promo Content Description
                    </label>
                    <textarea
                      value={activeSection.content_data?.text || ''}
                      onChange={e => handleUpdateSection(activeSection.id, { content_data: { text: e.target.value } })}
                      placeholder="Add promotional lines or descriptions"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        BG Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={activeSection.settings?.bg_color || '#e94560'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { bg_color: e.target.value } })}
                          className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800"
                        />
                        <input
                          type="text"
                          value={activeSection.settings?.bg_color || '#e94560'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { bg_color: e.target.value } })}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        Text Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={activeSection.settings?.text_color || '#ffffff'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { text_color: e.target.value } })}
                          className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800"
                        />
                        <input
                          type="text"
                          value={activeSection.settings?.text_color || '#ffffff'}
                          onChange={e => handleUpdateSection(activeSection.id, { settings: { text_color: e.target.value } })}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Link URL
                    </label>
                    <input
                      type="text"
                      value={activeSection.content_data?.link || ''}
                      onChange={e => handleUpdateSection(activeSection.id, { content_data: { link: e.target.value } })}
                      placeholder="/shop"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={activeSection.content_data?.button_text || 'Shop Offer'}
                      onChange={e => handleUpdateSection(activeSection.id, { content_data: { button_text: e.target.value } })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Specific inputs for trust_badges */}
              {activeSection.section_type === 'trust_badges' && (
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-150 dark:border-gray-800/80 text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <Lock className="h-4 w-4 text-[#e94560] flex-shrink-0 mt-0.5" />
                  <span>
                    Individual badges, descriptions, and icons are controlled in the General Settings &gt; Premium Features tab. Customize them there.
                  </span>
                </div>
              )}

              {/* Specific inputs for recent_reviews */}
              {activeSection.section_type === 'recent_reviews' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Reviews Limit
                    </label>
                    <span className="text-xs font-bold text-[#e94560]">
                      {activeSection.settings?.limit || 3}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    value={activeSection.settings?.limit || 3}
                    onChange={e => handleUpdateSection(activeSection.id, { settings: { limit: parseInt(e.target.value) } })}
                    className="w-full accent-[#e94560]"
                  />
                </div>
              )}

              {/* Specific inputs for brands_logos */}
              {activeSection.section_type === 'brands_logos' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    Partner Logo URLs
                  </label>
                  <textarea
                    value={activeSection.content_data?.logos?.join('\n') || ''}
                    onChange={e => handleUpdateSection(activeSection.id, { content_data: { logos: e.target.value.split('\n').filter(Boolean) } })}
                    placeholder="Enter one image URL per line"
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {activeSection.section_type === 'social_feed' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={activeSection.content_data?.subtitle || ''}
                      onChange={e => handleUpdateSection(activeSection.id, { content_data: { subtitle: e.target.value } })}
                      placeholder="#ZAYNAHSVOGUE"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Description (Optional)</label>
                    <input
                      type="text"
                      value={activeSection.content_data?.desc || ''}
                      onChange={e => handleUpdateSection(activeSection.id, { content_data: { desc: e.target.value } })}
                      placeholder="Tag us in your post..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Number of Posts to Show</label>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {activeSection.settings?.limit || 8}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="4"
                      value={activeSection.settings?.limit || 8}
                      onChange={e => handleUpdateSection(activeSection.id, { settings: { limit: parseInt(e.target.value) } })}
                      className="w-full accent-[#e94560]"
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                    Note: To edit the actual social posts, please visit Settings -&gt; Store Configuration.
                  </div>
                </div>
              )}

              {activeSection.section_type === 'category_grid' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Category Grid Cards</h4>
                    <button
                      onClick={() => {
                        const items = activeSection.content_data?.items || [];
                        handleUpdateSection(activeSection.id, {
                          content_data: { items: [...items, { title: '', link: '', imageUrl: '' }] }
                        });
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
                    >
                      + Add Card
                    </button>
                  </div>
                  
                  {(() => {
                    const items = activeSection.content_data?.items || [];
                    if (items.length === 0) {
                      return <p className="text-xs text-gray-500">No cards added yet. Click "+ Add Card" to start.</p>;
                    }
                    return items.map((item: any, idx: number) => {
                      const updateGridItem = (itemUpdates: any) => {
                        const updatedItems = [...items];
                        updatedItems[idx] = { ...item, ...itemUpdates };
                        handleUpdateSection(activeSection.id, { content_data: { items: updatedItems } });
                      };

                      const removeGridItem = () => {
                        const updatedItems = [...items];
                        updatedItems.splice(idx, 1);
                        handleUpdateSection(activeSection.id, { content_data: { items: updatedItems } });
                      };

                      const openMediaSelectorForGrid = () => {
                        setMediaUploadTarget({
                          sectionId: activeSection.id,
                          fieldPath: 'content_data',
                          fieldKey: 'imageUrl',
                          isGridItem: true,
                          gridIndex: idx
                        });
                        setIsMediaModalOpen(true);
                      };

                      return (
                        <div key={idx} className="border border-gray-200 dark:border-gray-800 p-3 rounded-xl bg-gray-50/55 dark:bg-[#0f0f1b]/55 space-y-3 relative group">
                          <button
                            onClick={removeGridItem}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove card"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase pr-6">
                            <span>Card {idx + 1}</span>
                            {item.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt="Card preview" className="w-8 h-8 object-cover rounded-lg" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Quick Select Category</label>
                            <select
                              className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-850 dark:text-gray-100 focus:outline-none"
                              onChange={(e) => {
                                const catId = e.target.value;
                                if (catId) {
                                  const cat = categories.find(c => c.id === catId);
                                  if (cat) {
                                    updateGridItem({ title: cat.name, link: `/category/${cat.slug}` });
                                  }
                                }
                              }}
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400">Card Label</label>
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={e => updateGridItem({ title: e.target.value })}
                                placeholder="e.g. Girls"
                                className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-850 dark:text-gray-100 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400">Target Link</label>
                              <input
                                type="text"
                                value={item.link || ''}
                                onChange={e => updateGridItem({ link: e.target.value })}
                                placeholder="e.g. /category/girls"
                                className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-gray-850 dark:text-gray-100 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-400 block">Upload Card Image</label>
                            <button
                              type="button"
                              onClick={openMediaSelectorForGrid}
                              className="w-full px-2 py-1.5 text-xs font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
                            >
                              Select Image
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW PANEL: Live simulated StoreFront view */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm h-full">
        {/* Preview Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/2 bg-surface-2">
          <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Live Preview
          </span>
          
          <div className="flex bg-gray-100 dark:bg-white/10 p-0.5 rounded-lg">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase transition-all ${
                viewportMode === 'desktop'
                  ? 'bg-white dark:bg-[#1a1a2e] text-[#e94560] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              } cursor-pointer`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-white dark:bg-[#1a1a2e] text-[#e94560] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              } cursor-pointer`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </button>
          </div>
        </div>

        {/* Viewport Frame Simulator */}
        <div className="flex-1 bg-gray-100 dark:bg-[#0f0f1b]/50 overflow-y-auto p-6 flex justify-center items-start">
          {viewportMode === 'mobile' ? (
            <div className="w-[375px] h-[700px] border-[12px] border-gray-800 dark:border-gray-900 rounded-[36px] overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] flex flex-col relative relative scrollbar-none">
              {/* Camera Notch decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-gray-800 dark:bg-gray-900 rounded-b-xl z-50 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-black rounded-full" />
              </div>
              <iframe
                ref={iframeRef}
                src="/admin/settings/customizer/preview"
                className="flex-1 w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="w-full bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
              <iframe
                ref={iframeRef}
                src="/admin/settings/customizer/preview"
                className="flex-1 w-full h-full border-none"
              />
            </div>
          )}
        </div>
      </div>
      
      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelected}
        multiple={false}
      />
    </div>
  );
}
