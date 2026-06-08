'use server';

import { createClient } from '@/lib/supabase/server';
import { Product, ProductImage, ProductVariant, ProductModifier, Category } from '@/lib/types';
import { unstable_cache, revalidateTag } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

interface DBProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string | null;
  sort_order?: number | null;
  is_primary?: boolean | null;
  created_at: string;
}

interface DBProductVariant {
  id: string;
  product_id: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  custom_option?: string | null;
  custom_value?: string | null;
  color_hex?: string | null;
  price?: string | number | null;
  compare_price?: string | number | null;
  stock?: number | null;
  sku?: string | null;
  image_url?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
}

interface DBProductModifier {
  id: string;
  product_id: string;
  name: string;
  price?: string | number | null;
  active?: boolean | null;
  sort_order?: number | null;
}

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface DBProductRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  price: string | number;
  compare_price?: string | number | null;
  cost?: string | number | null;
  sku?: string | null;
  category_id?: string | null;
  categories?: DBCategory | null;
  stock?: number | null;
  has_variants?: boolean | null;
  is_service?: boolean | null;
  is_featured?: boolean | null;
  active?: boolean | null;
  enable_swatches?: boolean | null;
  show_swatches_on_archive?: boolean | null;
  tags?: string[] | null;
  rating?: number | string | null;
  reviews_count?: number | null;
  product_images?: DBProductImage[] | null;
  product_variants?: DBProductVariant[] | null;
  product_modifiers?: DBProductModifier[] | null;
  custom_badge_id?: string | null;
  badge_enabled?: boolean | null;
  badges?: any | null;
  size_guide_id?: string | null;
  size_guides?: any | null;
  frequently_bought_together_ids?: string[] | null;
  flash_sale_enabled?: boolean | null;
  flash_sale_start_date?: string | null;
  flash_sale_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

const mapProduct = (row: DBProductRow): Product => {
  const images: ProductImage[] = (row.product_images ?? []).map((img: DBProductImage) => ({
    id: img.id,
    productId: img.product_id,
    url: img.url,
    alt: img.alt || undefined,
    sortOrder: img.sort_order || 0,
    isPrimary: img.is_primary ?? false,
    createdAt: img.created_at
  })).sort((a: ProductImage, b: ProductImage) => a.sortOrder - b.sortOrder);

  const variants: ProductVariant[] = (row.product_variants ?? []).map((v: DBProductVariant) => ({
    id: v.id,
    productId: v.product_id,
    color: v.color || undefined,
    size: v.size || undefined,
    material: v.material || undefined,
    customOption: v.custom_option || undefined,
    customValue: v.custom_value || undefined,
    colorHex: v.color_hex || undefined,
    price: v.price ? parseFloat(v.price.toString()) : undefined,
    comparePrice: v.compare_price ? parseFloat(v.compare_price.toString()) : undefined,
    stock: v.stock || 0,
    sku: v.sku || undefined,
    imageUrl: v.image_url || undefined,
    active: v.active ?? true,
    sortOrder: v.sort_order || 0
  })).sort((a: ProductVariant, b: ProductVariant) => a.sortOrder - b.sortOrder);

  const modifiers: ProductModifier[] = (row.product_modifiers ?? []).map((m: DBProductModifier) => ({
    id: m.id,
    productId: m.product_id,
    name: m.name,
    price: m.price ? parseFloat(m.price.toString()) : 0,
    active: m.active ?? true,
    sortOrder: m.sort_order || 0
  })).sort((a: ProductModifier, b: ProductModifier) => a.sortOrder - b.sortOrder);

  const category: Category | undefined = row.categories ? {
    id: row.categories.id,
    name: row.categories.name,
    slug: row.categories.slug,
    description: row.categories.description || undefined,
    imageUrl: row.categories.image_url || undefined,
    sortOrder: row.categories.sort_order || 0,
    active: row.categories.active ?? true,
    createdAt: row.categories.created_at,
    updatedAt: row.categories.updated_at
  } : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    shortDescription: row.short_description || undefined,
    price: row.price ? parseFloat(row.price.toString()) : 0,
    comparePrice: row.compare_price ? parseFloat(row.compare_price.toString()) : undefined,
    cost: row.cost ? parseFloat(row.cost.toString()) : undefined,
    sku: row.sku || undefined,
    categoryId: row.category_id || undefined,
    category,
    stock: row.stock || 0,
    hasVariants: row.has_variants ?? false,
    isService: row.is_service ?? false,
    isFeatured: row.is_featured ?? false,
    active: row.active ?? true,
    enableSwatches: row.enable_swatches ?? true,
    showSwatchesOnArchive: row.show_swatches_on_archive ?? true,
    customBadgeId: row.custom_badge_id || undefined,
    badgeEnabled: row.badge_enabled ?? true,
    customBadge: row.badges ? {
      id: row.badges.id,
      name: row.badges.name,
      bgColor: row.badges.bg_color,
      textColor: row.badges.text_color
    } : undefined,
    sizeGuideId: row.size_guide_id || undefined,
    sizeGuide: row.size_guides ? {
      id: row.size_guides.id,
      name: row.size_guides.name,
      chart_data: Array.isArray(row.size_guides.chart_data) ? row.size_guides.chart_data : [],
      imageUrl: row.size_guides.image_url || undefined
    } : undefined,
    frequentlyBoughtTogetherIds: row.frequently_bought_together_ids || [],
    flashSaleEnabled: row.flash_sale_enabled ?? false,
    flashSaleStartDate: row.flash_sale_start_date || undefined,
    flashSaleEndDate: row.flash_sale_end_date || undefined,
    tags: row.tags ?? [],
    images,
    variants,
    modifiers,
    rating: row.rating ? parseFloat(row.rating.toString()) : undefined,
    reviewsCount: row.reviews_count !== null && row.reviews_count !== undefined ? row.reviews_count : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const fetchProducts = async (categoryId?: string): Promise<Product[]> => {
  let query = staticSupabase
    .from('products')
    .select('*, product_images(*), product_variants(*), product_modifiers(*), categories(*), badges(*), size_guides(*)')
    .eq('active', true);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
};

const cachedProducts = unstable_cache(
  async (categoryId?: string) => fetchProducts(categoryId),
  ['products-list'],
  { revalidate: 3600, tags: ['products'] }
);

export const getProducts = async (categoryId?: string) => {
  if (process.env.NODE_ENV === 'development') {
    return fetchProducts(categoryId);
  }
  return cachedProducts(categoryId);
};

const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await staticSupabase
    .from('products')
    .select('*, product_images(*), product_variants(*), product_modifiers(*), categories(*), badges(*), size_guides(*)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data) : null;
};

const cachedProductBySlug = unstable_cache(
  async (slug: string) => fetchProductBySlug(slug),
  ['product-by-slug'],
  { revalidate: 3600, tags: ['products'] }
);

export const getProductBySlug = async (slug: string) => {
  if (process.env.NODE_ENV === 'development') {
    return fetchProductBySlug(slug);
  }
  return cachedProductBySlug(slug);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories(*), badges(*), size_guides(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProduct(data) : null;
  } catch (error) {
    console.error('[products] getProductById failed:', error);
    throw error;
  }
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories(*), badges(*), size_guides(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (error) {
    console.error('[products] getAllProductsAdmin failed:', error);
    throw error;
  }
};

export const createProduct = async (
  product: Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[],
  variants: Omit<ProductVariant, 'id' | 'productId'>[],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[]
): Promise<Product> => {
  try {
    const supabase = await createClient();

    // 1. Insert product core
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.shortDescription,
        price: product.price,
        compare_price: product.comparePrice,
        cost: product.cost,
        sku: product.sku,
        category_id: product.categoryId,
        stock: product.stock,
        has_variants: product.hasVariants,
        is_service: product.isService,
        is_featured: product.isFeatured,
        active: product.active,
        enable_swatches: product.enableSwatches,
        show_swatches_on_archive: product.showSwatchesOnArchive,
        custom_badge_id: product.customBadgeId || null,
        badge_enabled: product.badgeEnabled ?? true,
        size_guide_id: product.sizeGuideId || null,
        frequently_bought_together_ids: product.frequentlyBoughtTogetherIds || [],
        flash_sale_enabled: product.flashSaleEnabled || false,
        flash_sale_start_date: product.flashSaleStartDate || null,
        flash_sale_end_date: product.flashSaleEndDate || null,
        tags: product.tags,
        rating: product.rating,
        reviews_count: product.reviewsCount
      })
      .select('*')
      .single();

    if (prodError) throw prodError;
    const productId = prodData.id;

    // 2. Insert Images
    if (images.length > 0) {
      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images.map(img => ({
          product_id: productId,
          url: img.url,
          alt: img.alt,
          sort_order: img.sortOrder,
          is_primary: img.isPrimary
        })));
      if (imgError) throw imgError;
    }

    // 3. Insert Variants
    if (product.hasVariants && variants.length > 0) {
      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({
          product_id: productId,
          color: v.color,
          size: v.size,
          material: v.material,
          custom_option: v.customOption,
          custom_value: v.customValue,
          color_hex: v.colorHex,
          price: v.price,
          compare_price: v.comparePrice,
          stock: v.stock,
          sku: v.sku,
          image_url: v.imageUrl,
          active: v.active,
          sort_order: v.sortOrder
        })));
      if (varError) throw varError;
    }

    // 4. Insert Modifiers
    if (modifiers.length > 0) {
      const { error: modError } = await supabase
        .from('product_modifiers')
        .insert(modifiers.map(m => ({
          product_id: productId,
          name: m.name,
          price: m.price,
          active: m.active,
          sort_order: m.sortOrder
        })));
      if (modError) throw modError;
    }

    // 5. Get final updated product structure
    const updatedProduct = await getProductById(productId);
    if (!updatedProduct) throw new Error('Product created but could not be retrieved');
    revalidateTag('products', 'max');
    return updatedProduct;
  } catch (error) {
    console.error('[products] createProduct failed:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[],
  variants: Omit<ProductVariant, 'id' | 'productId'>[],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[]
): Promise<Product> => {
  try {
    const supabase = await createClient();

    // 1. Update product core
    const updatePayload: Record<string, any> = {};
    if (product.name !== undefined) updatePayload.name = product.name;
    if (product.slug !== undefined) updatePayload.slug = product.slug;
    if (product.description !== undefined) updatePayload.description = product.description;
    if (product.shortDescription !== undefined) updatePayload.short_description = product.shortDescription;
    if (product.price !== undefined) updatePayload.price = product.price;
    if (product.comparePrice !== undefined) updatePayload.compare_price = product.comparePrice;
    if (product.cost !== undefined) updatePayload.cost = product.cost;
    if (product.sku !== undefined) updatePayload.sku = product.sku;
    if (product.categoryId !== undefined) updatePayload.category_id = product.categoryId;
    if (product.stock !== undefined) updatePayload.stock = product.stock;
    if (product.hasVariants !== undefined) updatePayload.has_variants = product.hasVariants;
    if (product.isService !== undefined) updatePayload.is_service = product.isService;
    if (product.isFeatured !== undefined) updatePayload.is_featured = product.isFeatured;
    if (product.active !== undefined) updatePayload.active = product.active;
    if (product.enableSwatches !== undefined) updatePayload.enable_swatches = product.enableSwatches;
    if (product.showSwatchesOnArchive !== undefined) updatePayload.show_swatches_on_archive = product.showSwatchesOnArchive;
    if (product.customBadgeId !== undefined) updatePayload.custom_badge_id = product.customBadgeId || null;
    if (product.badgeEnabled !== undefined) updatePayload.badge_enabled = product.badgeEnabled;
    if (product.sizeGuideId !== undefined) updatePayload.size_guide_id = product.sizeGuideId || null;
    if (product.frequentlyBoughtTogetherIds !== undefined) updatePayload.frequently_bought_together_ids = product.frequentlyBoughtTogetherIds;
    if (product.flashSaleEnabled !== undefined) updatePayload.flash_sale_enabled = product.flashSaleEnabled;
    if (product.flashSaleStartDate !== undefined) updatePayload.flash_sale_start_date = product.flashSaleStartDate || null;
    if (product.flashSaleEndDate !== undefined) updatePayload.flash_sale_end_date = product.flashSaleEndDate || null;
    if (product.tags !== undefined) updatePayload.tags = product.tags;
    if (product.rating !== undefined) updatePayload.rating = product.rating;
    if (product.reviewsCount !== undefined) updatePayload.reviews_count = product.reviewsCount;

    const { error: prodError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (prodError) throw prodError;

    // 2. Sync Images (Delete old, insert new)
    const { error: imgDelError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);
    if (imgDelError) throw imgDelError;

    if (images.length > 0) {
      const { error: imgInsError } = await supabase
        .from('product_images')
        .insert(images.map(img => ({
          product_id: id,
          url: img.url,
          alt: img.alt,
          sort_order: img.sortOrder,
          is_primary: img.isPrimary
        })));
      if (imgInsError) throw imgInsError;
    }

    // 3. Sync Variants (Delete old, insert new)
    const { error: varDelError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    if (varDelError) throw varDelError;

    if ((product.hasVariants ?? true) && variants.length > 0) {
      const { error: varInsError } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({
          product_id: id,
          color: v.color,
          size: v.size,
          material: v.material,
          custom_option: v.customOption,
          custom_value: v.customValue,
          color_hex: v.colorHex,
          price: v.price,
          compare_price: v.comparePrice,
          stock: v.stock,
          sku: v.sku,
          image_url: v.imageUrl,
          active: v.active,
          sort_order: v.sortOrder
        })));
      if (varInsError) throw varInsError;
    }

    // 4. Sync Modifiers
    const { error: modDelError } = await supabase
      .from('product_modifiers')
      .delete()
      .eq('product_id', id);
    if (modDelError) throw modDelError;

    if (modifiers.length > 0) {
      const { error: modInsError } = await supabase
        .from('product_modifiers')
        .insert(modifiers.map(m => ({
          product_id: id,
          name: m.name,
          price: m.price,
          active: m.active,
          sort_order: m.sortOrder
        })));
      if (modInsError) throw modInsError;
    }

    // 5. Get final updated product structure
    const updatedProduct = await getProductById(id);
    if (!updatedProduct) throw new Error('Product updated but could not be retrieved');
    revalidateTag('products', 'max');
    return updatedProduct;
  } catch (error) {
    console.error('[products] updateProduct failed:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    // Soft delete product by setting active = false
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
    revalidateTag('products', 'max');
  } catch (error) {
    console.error('[products] deleteProduct failed:', error);
    throw error;
  }
};
