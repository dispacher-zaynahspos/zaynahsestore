'use client';

import React from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';
import { Play } from '@/components/common/Icons';

interface SocialFeedRibbonProps {
  settings: StoreSettings;
}

export default function SocialFeedRibbon({ settings }: SocialFeedRibbonProps) {
  if (settings.social_feeds_enabled === false) return null;
  if (settings.social_feeds_product_enabled === false) return null;

  const parsedFeeds = React.useMemo(() => {
    const items = settings.social_feeds_items;
    if (!items) return [];
    try {
      const arr = typeof items === 'string' ? JSON.parse(items) : items;
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [settings.social_feeds_items]);

  const feedsToDisplay = parsedFeeds.length > 0 ? parsedFeeds : [
    { id: 'v1', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70', link: '#', username: 'buyer1', caption: 'Stunning piece!' },
    { id: 'v2', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=70', link: '#', username: 'buyer2', caption: 'Obsessed with the quality.' },
    { id: 'v3', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=70', link: '#', username: 'buyer3', caption: 'Super fast shipping!' },
    { id: 'v4', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=70', link: '#', username: 'buyer4', caption: 'Highly recommended.' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
          {settings.social_feeds_subtitle || '#ZAYNAHSVOGUE'}
        </span>
        <h3 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
          {settings.social_feeds_title || 'Follow Us On Social Media'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-semibold">
          {settings.social_feeds_desc || 'Tag us in your post to get featured on our page'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {feedsToDisplay.slice(0, 8).map((feed, idx) => (
          <a
            key={feed.id || idx}
            href={feed.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[9/16] bg-gray-155 dark:bg-gray-800 rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-800 block cursor-pointer"
          >
            <Image
              src={feed.imageUrl}
              alt={feed.caption || `Social post by @${feed.username}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={true}
            />
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/40 shadow self-end">
                <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white">@{feed.username}</p>
                {feed.caption && <p className="text-[9px] text-gray-300 line-clamp-2 mt-0.5 leading-tight">{feed.caption}</p>}
              </div>
            </div>
            {/* Default username tag */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2.5 py-1 rounded-full group-hover:opacity-0 transition-opacity">
              @{feed.username}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
