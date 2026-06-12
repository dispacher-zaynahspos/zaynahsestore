import { Product, StoreSettings } from '@/lib/types';

/**
 * Maps a product (and its active variants, if any) to the Meta Catalog Graph API schema.
 * Returns an array of catalog items (each representing either a simple product or a variant).
 */
export function mapProductToMeta(
  product: Product,
  settings: StoreSettings,
  categoryMap: Record<string, string>
): any[] {
  const brandName = settings.storeName || 'Zaynahs';
  const currency = settings.currency || 'PKR';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';
  
  // Find primary image url
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || 
                        product.images?.[0]?.url || 
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';

  const additionalImages = product.images?.filter(img => !img.isPrimary).map(img => img.url) || [];
  
  // Resolve standard Meta category path
  const categoryPath = (product.categoryId && categoryMap[product.categoryId]) || 'Apparel & Accessories > Clothing';

  const baseDescription = product.description || product.name;

  // If the product has active variants, map each variant as an item in Meta Catalog
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    return product.variants
      .filter(v => v.active)
      .map(v => {
        const variantNameParts = [];
        if (v.color) variantNameParts.push(v.color);
        if (v.size) variantNameParts.push(v.size);
        if (v.material) variantNameParts.push(v.material);
        if (v.customValue) variantNameParts.push(v.customValue);
        
        const variantName = variantNameParts.length > 0 
          ? `${product.name} - ${variantNameParts.join(', ')}`
          : product.name;

        const variantPrice = v.price || product.price;
        const variantImageUrl = v.imageUrl || primaryImage;

        return {
          retailer_id: v.id,
          item_group_id: product.id,
          name: variantName,
          description: baseDescription,
          price: `${variantPrice} ${currency}`,
          currency: currency,
          availability: v.stock > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          url: `${siteUrl}/product/${product.slug}`,
          image_url: variantImageUrl,
          additional_image_urls: additionalImages,
          brand: brandName,
          category: categoryPath,
          inventory: v.stock,
          color: v.color || undefined,
          size: v.size || undefined,
          material: v.material || undefined
        };
      });
  }

  // Simple product mapping (no variants)
  return [{
    retailer_id: product.id,
    name: product.name,
    description: baseDescription,
    price: `${product.price} ${currency}`,
    currency: currency,
    availability: product.stock > 0 ? 'in stock' : 'out of stock',
    condition: 'new',
    url: `${siteUrl}/product/${product.slug}`,
    image_url: primaryImage,
    additional_image_urls: additionalImages,
    brand: brandName,
    category: categoryPath,
    inventory: product.stock
  }];
}
