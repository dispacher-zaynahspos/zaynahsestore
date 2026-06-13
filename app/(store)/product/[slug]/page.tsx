import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/store/ProductDetail';
import ProductReviews from '@/components/store/ProductReviews';
import ProductCard from '@/components/store/ProductCard';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/products';
import { getSettings } from '@/lib/services/settings';
import { getProductReviews, getAverageRating } from '@/lib/services/reviews';
import { Product } from '@/lib/types';
import RecentlyViewed from '@/components/store/RecentlyViewed';
import SocialFeedRibbon from '@/components/store/SocialFeedRibbon';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import { headers } from 'next/headers';

export const revalidate = 60; // Cache for 1 minute

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return {};

    const { data: seoMeta } = await supabaseAdmin
      .from('seo_meta')
      .select('*')
      .eq('entity_type', 'product')
      .eq('entity_id', product.id)
      .maybeSingle();

    const settings = await getSettings();
    const headersList = await headers();
    const host = headersList.get('host') || 'zaynahs.pk';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const siteUrl = `${protocol}://${host}`;
    const brandName = settings.storeName || 'Zaynahs E-Store';

    const title = seoMeta?.seo_title || `${product.name} | ${brandName}`;
    const description = seoMeta?.meta_description || product.description?.slice(0, 160) || '';
    const canonicalUrl = `${siteUrl}/product/${slug}`;
    const imageUrl = product.images?.[0]?.url || '/og-default.jpg';

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: seoMeta?.og_title || title,
        description: seoMeta?.og_description || description,
        url: canonicalUrl,
        type: 'website',
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: 'summary_large_image',
        title: seoMeta?.twitter_title || title,
        description: seoMeta?.twitter_description || description,
        images: [imageUrl],
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'PKR',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
        'product:retailer_item_id': product.id,
      }
    };
  } catch (err) {
    return {
      title: 'Product Details'
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get seo meta details
  const { data: seoMeta } = await supabaseAdmin
    .from('seo_meta')
    .select('*')
    .eq('entity_type', 'product')
    .eq('entity_id', product.id)
    .maybeSingle();

  const [settings, reviews, averageRating, relatedProducts] = await Promise.all([
    getSettings(),
    getProductReviews(product.id),
    getAverageRating(product.id),
    getRelatedProducts(product.id, product.categoryId, 4)
  ]);

  const layout = settings.productPageLayout || ['details', 'ticker', 'reviews', 'related', 'recently_viewed', 'social_feed'];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(i => i.url) || [],
    "description": product.description || '',
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": settings.storeName || 'Zaynahs'
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "PKR",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${siteUrl}/product/${slug}`
    }
  };

  const faqSchema = seoMeta?.faq_schema && Array.isArray(seoMeta.faq_schema) && seoMeta.faq_schema.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seoMeta.faq_schema.map((item: any) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb
          items={[
            ...(product.category ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }] : []),
            { label: product.name, href: `/product/${slug}` }
          ]}
        />
      </div>

      <div className="space-y-10 pb-16">
        {layout.map((block: string) => {
          if (block === 'details') {
            return (
              <ProductDetail key="details" product={product} settings={settings} averageRating={averageRating} />
            );
          }
          if (block === 'ticker') {
            if (!settings.enableTicker || !settings.tickerText) return null;
            return (
              <div key="ticker" className="w-full overflow-hidden bg-gray-50 dark:bg-white/5 border-y border-gray-200 dark:border-gray-800 py-3.5 select-none relative">
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee-infinite {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                  }
                  .animate-marquee-infinite:hover {
                    animation-play-state: paused;
                  }
                `}</style>
                
                <div className="animate-marquee-infinite flex items-center whitespace-nowrap gap-8">
                  {[...Array(4)].map((_, loopIdx) => (
                    <div key={loopIdx} className="flex items-center gap-8">
                      {settings.tickerText.split('\n').filter(Boolean).map((item: string, itemIdx: number) => (
                        <div key={itemIdx} className="flex items-center gap-8 text-sm font-bold text-gray-850 dark:text-gray-200 uppercase tracking-wider">
                          <span>{item}</span>
                          <span className="text-gray-400 dark:text-gray-600 font-normal">✦</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          if (block === 'reviews') {
            return (
              <div key="reviews" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ProductReviews product={product} reviews={reviews} averageRating={averageRating} />
              </div>
            );
          }
          if (block === 'related') {
            if (relatedProducts.length === 0) return null;
            return (
              <div key="related" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10">
                <div className="text-center md:text-left mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Related Products</h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    You might also like these handpicked recommendations
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((prod: Product) => (
                    <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
                  ))}
                </div>
              </div>
            );
          }
          if (block === 'recently_viewed') {
            return (
              <RecentlyViewed 
                key="recently_viewed" 
                settings={settings} 
                currentProductId={product.id} 
              />
            );
          }
          if (block === 'social_feed') {
            return (
              <SocialFeedRibbon 
                key="social_feed" 
                settings={settings} 
              />
            );
          }
          return null;
        })}
      </div>
    </>
  );
}
