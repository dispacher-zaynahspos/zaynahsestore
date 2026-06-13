import React from 'react';
import ShopPage from '@/components/store/ShopPage';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { getSettings } from '@/lib/services/settings';
import { Metadata } from 'next';
import { headers } from 'next/headers';

export const revalidate = 0; // Dynamic server rendering on request

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    const headersList = await headers();
    const host = headersList.get('host') || 'zaynahs.pk';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;
    
    const brandName = settings.storeName || 'Zaynahs E-Store';
    const title = `Shop Products | ${brandName}`;
    const description = settings.tagline || `Browse our collection of premium products. Confirm your orders instantly via WhatsApp.`;
    const imageUrl = settings.logoUrl || `${siteUrl}/og-default.jpg`;

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/shop`,
        type: 'website',
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      }
    };
  } catch (err) {
    return {
      title: 'Shop'
    };
  }
}

export default async function StoreShopPage() {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings()
  ]);

  return (
    <ShopPage
      initialProducts={products}
      categories={categories}
      settings={settings}
    />
  );
}
