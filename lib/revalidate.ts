import { revalidateTag } from 'next/cache';

/**
 * Purge specific URLs from the Cloudflare Edge CDN cache.
 * Uses CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables.
 * 
 * @param urls Array of absolute URLs to purge
 */
const purgeCloudflareCache = async (urls: string[]) => {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.warn('[Cloudflare] Cache purge skipped. Zone ID or API Token environment variables missing.');
    return;
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Cloudflare] Purge API error:', result);
    } else {
      console.log('[Cloudflare] Cache purged successfully for:', urls, result);
    }
  } catch (error) {
    console.error('[Cloudflare] Fetch request failed during cache purge:', error);
  }
};

/**
 * Revalidate cache for a specific product page.
 */
export async function revalidateProduct(slug: string) {
  try {
    console.log(`[Revalidate] Triggering revalidation for product: ${slug}`);
    
    // 1. Next.js cache revalidation
    revalidateTag(`product-${slug}`, 'max');
    revalidateTag('products', 'max');

    // 2. Cloudflare Cache Purge
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (siteUrl) {
      const urls = [
        `${siteUrl}/product/${slug}`,
        `${siteUrl}/`,
      ];
      await purgeCloudflareCache(urls);
    }
  } catch (error) {
    console.error(`[Revalidate] revalidateProduct failed for slug: ${slug}`, error);
  }
}

/**
 * Revalidate cache when banners are modified.
 */
export async function revalidateBanner() {
  try {
    console.log('[Revalidate] Triggering revalidation for banners');

    // 1. Next.js cache revalidation
    revalidateTag('banners', 'max');
    revalidateTag('homepage', 'max');

    // 2. Cloudflare Cache Purge
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (siteUrl) {
      await purgeCloudflareCache([`${siteUrl}/`]);
    }
  } catch (error) {
    console.error('[Revalidate] revalidateBanner failed:', error);
  }
}

/**
 * Revalidate cache for a specific category.
 */
export async function revalidateCategory(slug: string) {
  try {
    console.log(`[Revalidate] Triggering revalidation for category: ${slug}`);

    // 1. Next.js cache revalidation
    revalidateTag(`category-${slug}`, 'max');
    revalidateTag('categories', 'max');

    // 2. Cloudflare Cache Purge
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (siteUrl) {
      const urls = [
        `${siteUrl}/category/${slug}`,
        `${siteUrl}/shop?category=${slug}`,
        `${siteUrl}/`,
      ];
      await purgeCloudflareCache(urls);
    }
  } catch (error) {
    console.error(`[Revalidate] revalidateCategory failed for slug: ${slug}`, error);
  }
}

/**
 * Revalidate cache for storefront homepage and settings.
 */
export async function revalidateHomepage() {
  try {
    console.log('[Revalidate] Triggering revalidation for homepage');

    // 1. Next.js cache revalidation
    revalidateTag('homepage', 'max');
    revalidateTag('banners', 'max');
    revalidateTag('settings', 'max');

    // 2. Cloudflare Cache Purge
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (siteUrl) {
      await purgeCloudflareCache([`${siteUrl}/`]);
    }
  } catch (error) {
    console.error('[Revalidate] revalidateHomepage failed:', error);
  }
}
