import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';

  // 1. Fetch products and categories
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('slug, updated_at, name')
    .eq('active', true);

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug, updated_at')
    .eq('active', true);

  // 2. Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 3. Add products
  if (products) {
    products.forEach((p) => {
      routes.push({
        url: `${siteUrl}/product/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  }

  // 4. Add categories
  if (categories) {
    categories.forEach((c) => {
      routes.push({
        url: `${siteUrl}/category/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  return routes;
}
