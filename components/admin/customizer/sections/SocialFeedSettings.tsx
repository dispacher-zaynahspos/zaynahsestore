'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';

interface SocialFeedSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function SocialFeedSettings({
  section,
  onUpdateSection
}: SocialFeedSettingsProps) {
  const settings = section.settings || {};
  const contentData = section.content_data || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  const handleContentChange = (key: string, value: any) => {
    onUpdateSection({
      content_data: { ...contentData, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Subtitle (Optional)</label>
        <input
          type="text"
          value={contentData.subtitle || ''}
          onChange={e => handleContentChange('subtitle', e.target.value)}
          placeholder="#ZAYNAHSVOGUE"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Description (Optional)</label>
        <input
          type="text"
          value={contentData.desc || ''}
          onChange={e => handleContentChange('desc', e.target.value)}
          placeholder="Tag us in your post..."
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>
      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Number of Posts to Show</label>
          <span className="text-xs font-black text-gray-900 dark:text-white">
            {settings.limit || 8}
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="12"
          step="4"
          value={settings.limit || 8}
          onChange={e => handleSettingsChange('limit', parseInt(e.target.value))}
          className="w-full accent-[#e94560]"
        />
      </div>
    </div>
  );
}
