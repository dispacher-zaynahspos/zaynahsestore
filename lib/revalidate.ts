import { revalidateTag } from 'next/cache';

const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function purgeCloudflareUrls(urls: string[]) {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    console.warn('Cloudflare credentials missing. Skipping cache purge.');
    return;
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
      }
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error('Failed to purge Cloudflare cache:', data);
    } else {
      console.log('Successfully purged Cloudflare cache:', urls);
    }
  } catch (error) {
    console.error('Error purging Cloudflare cache:', error);
  }
}

export async function revalidateProduct(slug: string) {
  try {
    // 1. Revalidate Next.js cache tag
    revalidateTag(`product-${slug}`);
    revalidateTag('products'); // Also revalidate products list tag if used

    // 2. Purge Cloudflare URL cache
    const urls = [`${SITE_URL}/product/${slug}`];
    await purgeCloudflareUrls(urls);
    console.log(`Revalidated product: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateProduct for ${slug}:`, error);
    throw error;
  }
}

export async function revalidateBanner() {
  try {
    // 1. Revalidate Next.js cache tags
    revalidateTag('banners');
    revalidateTag('homepage');

    // 2. Purge Cloudflare homepage cache
    const urls = [`${SITE_URL}/`, `${SITE_URL}`];
    await purgeCloudflareUrls(urls);
    console.log('Revalidated banners & homepage');
  } catch (error) {
    console.error('Error in revalidateBanner:', error);
    throw error;
  }
}

export async function revalidateCategory(slug: string) {
  try {
    // 1. Revalidate Next.js cache tags
    revalidateTag(`category-${slug}`);
    revalidateTag('categories');

    // 2. Purge Cloudflare URL cache
    const urls = [
      `${SITE_URL}/category/${slug}`,
      `${SITE_URL}/shop?category=${slug}`
    ];
    await purgeCloudflareUrls(urls);
    console.log(`Revalidated category: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateCategory for ${slug}:`, error);
    throw error;
  }
}

export async function revalidateHomepage() {
  try {
    // 1. Revalidate Next.js cache tags
    revalidateTag('homepage');

    // 2. Purge Cloudflare homepage cache
    const urls = [`${SITE_URL}/`, `${SITE_URL}`];
    await purgeCloudflareUrls(urls);
    console.log('Revalidated homepage');
  } catch (error) {
    console.error('Error in revalidateHomepage:', error);
    throw error;
  }
}
