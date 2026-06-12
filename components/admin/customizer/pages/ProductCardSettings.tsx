'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown, Eye, Check } from '@/components/common/Icons';

interface ProductCardSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export default function ProductCardSettings({ settings, onUpdateSettings }: ProductCardSettingsProps) {
  const activeStyle = settings.card_style || 'style1';
  const showStars = settings.card_show_stars !== false;
  const showQuickview = settings.card_show_quickview !== false;
  const showWishlist = settings.card_show_wishlist !== false;
  const showQuickcart = settings.card_show_quickcart !== false;
  const alignment = settings.card_alignment || 'left';
  const elementsOrder = settings.card_elements_order || ['title', 'rating', 'price', 'swatches'];

  const styles = [
    {
      id: 'style1',
      name: 'Current Style',
      desc: 'Floating round icons on image hover/touch'
    },
    {
      id: 'style2',
      name: 'Bottom Action Bar',
      desc: 'Sleek bottom overlay bar with actions on image hover'
    },
    {
      id: 'style3',
      name: 'Minimal Clean',
      desc: 'No image hover overlays, flat Add to Cart button below'
    },
    {
      id: 'style4',
      name: 'Editorial Magazine',
      desc: 'Zara-like slim borders, flat heart icon, minimal fonts'
    },
    {
      id: 'style5',
      name: 'Flash Sale Promo',
      desc: 'Countdown timer overlay + stock sold progress bar'
    }
  ];

  const elementLabels: Record<string, string> = {
    title: 'Product Title',
    rating: 'Star Rating',
    price: 'Price Tag',
    swatches: 'Color Swatches'
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...elementsOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[swapIndex];
      newOrder[swapIndex] = temp;
      onUpdateSettings({ card_elements_order: newOrder });
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates Selector */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Product Card Style Template
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {styles.map(style => {
            const isActive = activeStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onUpdateSettings({ card_style: style.id as any })}
                className={`w-full text-left p-3.5 border rounded-2xl transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 ring-1 ring-[#e94560]'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    {style.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-semibold">
                    {style.desc}
                  </p>
                </div>
                {isActive && (
                  <div className="h-5 w-5 rounded-full bg-[#e94560] flex items-center justify-center text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Card Features Visibility
        </label>
        <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5">
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Show Rating Stars</span>
            <input
              type="checkbox"
              checked={showStars}
              onChange={e => onUpdateSettings({ card_show_stars: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Show Wishlist Button</span>
            <input
              type="checkbox"
              checked={showWishlist}
              onChange={e => onUpdateSettings({ card_show_wishlist: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Show Quick View Button</span>
            <input
              type="checkbox"
              checked={showQuickview}
              onChange={e => onUpdateSettings({ card_show_quickview: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Show Quick Cart Button</span>
            <input
              type="checkbox"
              checked={showQuickcart}
              onChange={e => onUpdateSettings({ card_show_quickcart: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Alignment Selector */}
      <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Content Alignment
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['left', 'center', 'right'].map(align => {
            const isActive = alignment === align;
            return (
              <button
                key={align}
                onClick={() => onUpdateSettings({ card_alignment: align as any })}
                className={`py-2 text-center rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {align}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Element Ordering */}
      <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Vertical Elements Sorting
        </label>
        <div className="space-y-2">
          {elementsOrder.map((element, idx) => (
            <div
              key={element}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] rounded-xl shadow-sm"
            >
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {elementLabels[element] || element}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="h-7 w-7 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === elementsOrder.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="h-7 w-7 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
