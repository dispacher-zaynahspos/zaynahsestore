'use client';

import React, { useEffect, useState } from 'react';
import { Product, StoreSettings } from '@/lib/types';
import ProductCard from './ProductCard';

interface RecentlyViewedProps {
  products: Product[];
  settings: StoreSettings;
  currentProductId: string;
}

export default function RecentlyViewed({ products, settings, currentProductId }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const limit = settings.recently_viewed_limit || 4;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      try {
        const recentStr = localStorage.getItem('recently-viewed') || '[]';
        const recentIds: string[] = JSON.parse(recentStr);

        // Filter out current product and ensure it exists and is active
        const filteredIds = recentIds.filter(id => id !== currentProductId);

        // Map IDs to actual product objects in the correct order
        const mapped = filteredIds
          .map(id => {
            const match = products.find(p => p.id === id);
            return match;
          })
          .filter((p): p is Product => !!p && p.active)
          .slice(0, limit);

        console.log('[RecentlyViewed Debug]', {
          recentIds,
          currentProductId,
          filteredIds,
          mappedCount: mapped.length
        });

        setRecentProducts(mapped);
      } catch (err) {
        console.error('Failed to parse recently viewed:', err);
      }
    };

    // Initialize
    handleUpdate();

    // Listen for updates
    window.addEventListener('recently-viewed-updated', handleUpdate);
    return () => {
      window.removeEventListener('recently-viewed-updated', handleUpdate);
    };
  }, [products, currentProductId, limit]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10 animate-fade-in">
      <div className="text-center md:text-left mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
          Products you have recently browsed
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
        ))}
      </div>
    </div>
  );
}
