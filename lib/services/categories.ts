'use server';

import { createClient } from '@/lib/supabase/server';
import { Category } from '@/lib/types';
import { unstable_cache, revalidateTag } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);


interface CategoryRow {
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

// Map database row to Category interface
const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || undefined,
  imageUrl: row.image_url || undefined,
  sortOrder: row.sort_order || 0,
  active: row.active ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await staticSupabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
};

const cachedCategories = unstable_cache(
  async () => fetchCategories(),
  ['categories-list'],
  { revalidate: 3600, tags: ['categories'] }
);

export const getCategories = async () => {
  if (process.env.NODE_ENV === 'development') {
    return fetchCategories();
  }
  return cachedCategories();
};

const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await staticSupabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCategory(data) : null;
};

const cachedCategoryBySlug = (slug: string) => unstable_cache(
  async () => fetchCategoryBySlug(slug),
  [`category-by-slug-${slug}`],
  { revalidate: 3600, tags: [`category-${slug}`, 'categories'] }
)();

export const getCategoryBySlug = async (slug: string) => {
  if (process.env.NODE_ENV === 'development') {
    return fetchCategoryBySlug(slug);
  }
  return cachedCategoryBySlug(slug);
};

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapCategory);
  } catch (error) {
    console.error('[categories] getAllCategories failed:', error);
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.imageUrl,
        sort_order: category.sortOrder,
        active: category.active
      })
      .select('*')
      .single();

    if (error) throw error;
    revalidateTag('categories', 'max');
    return mapCategory(data);
  } catch (error) {
    console.error('[categories] createCategory failed:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  try {
    const supabase = await createClient();
    const updatePayload: Record<string, string | number | boolean | null | undefined> = {};
    if (category.name !== undefined) updatePayload.name = category.name;
    if (category.slug !== undefined) updatePayload.slug = category.slug;
    if (category.description !== undefined) updatePayload.description = category.description;
    if (category.imageUrl !== undefined) updatePayload.image_url = category.imageUrl;
    if (category.sortOrder !== undefined) updatePayload.sort_order = category.sortOrder;
    if (category.active !== undefined) updatePayload.active = category.active;

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    revalidateTag('categories', 'max');
    return mapCategory(data);
  } catch (error) {
    console.error('[categories] updateCategory failed:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    // Soft delete category by setting active = false
    const { error } = await supabase
      .from('categories')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
    revalidateTag('categories', 'max');
  } catch (error) {
    console.error('[categories] deleteCategory failed:', error);
    throw error;
  }
};
