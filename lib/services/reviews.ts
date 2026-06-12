'use server';

import { createClient } from '@/lib/supabase/server';
import { Review } from '@/lib/types';
import { unstable_cache, revalidateTag } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

interface DBReview {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone?: string | null;
  rating: number;
  comment?: string | null;
  approved: boolean;
  created_at: string;
}

const mapReview = (row: DBReview): Review => ({
  id: row.id,
  productId: row.product_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone || undefined,
  rating: row.rating,
  comment: row.comment || undefined,
  approved: row.approved ?? false,
  createdAt: row.created_at
});

// 1. Fetch approved reviews for a product (public)
const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  const { data, error } = await staticSupabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapReview);
};

const cachedProductReviews = unstable_cache(
  async (productId: string) => fetchProductReviews(productId),
  ['product-reviews-list'],
  { revalidate: 3600, tags: ['reviews'] }
);

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  if (process.env.NODE_ENV === 'development') {
    return fetchProductReviews(productId);
  }
  return cachedProductReviews(productId);
};

// 2. Fetch all reviews (admin)
export const getAllReviews = async (): Promise<(Review & { productName?: string })[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data ?? []).map(row => ({
      ...mapReview(row),
      productName: row.products?.name
    }));
  } catch (error) {
    console.error('[reviews] getAllReviews failed:', error);
    throw error;
  }
};

// 3. Submit a review (public, defaults to approved=false)
export const submitReview = async (review: {
  productId: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment?: string;
}): Promise<Review> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: review.productId,
        customer_name: review.customerName,
        customer_phone: review.customerPhone || null,
        rating: review.rating,
        comment: review.comment || null,
        approved: false
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Revalidate reviews caches
    revalidateTag('reviews', 'max');
    revalidateTag('products', 'max');
    
    const savedReview = mapReview(data);

    // Await the email dispatch so the serverless function does not exit/freeze before delivery completes
    try {
      const { getProductById } = await import('@/lib/services/products');
      const product = await getProductById(review.productId);
      if (product) {
        const { onNewReview } = await import('@/lib/email/triggers');
        await onNewReview(savedReview, product);
      }
    } catch (err) {
      console.error('[Email Trigger] failed in submitReview trigger:', err);
    }
    
    return savedReview;
  } catch (error) {
    console.error('[reviews] submitReview failed:', error);
    throw error;
  }
};

// 4. Approve a review (admin)
export const approveReview = async (id: string): Promise<Review> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    revalidateTag('reviews', 'max');
    revalidateTag('products', 'max');
    return mapReview(data);
  } catch (error) {
    console.error('[reviews] approveReview failed:', error);
    throw error;
  }
};

// 5. Delete a review (admin)
export const deleteReview = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    revalidateTag('reviews', 'max');
    revalidateTag('products', 'max');
  } catch (error) {
    console.error('[reviews] deleteReview failed:', error);
    throw error;
  }
};

// 6. Get average rating and count for a product
const fetchAverageRating = async (productId: string): Promise<{ average: number; count: number }> => {
  const { data, error } = await staticSupabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('approved', true);

  if (error) throw error;

  const count = data?.length ?? 0;
  if (count === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place

  return { average, count };
};

const cachedAverageRating = unstable_cache(
  async (productId: string) => fetchAverageRating(productId),
  ['product-average-rating'],
  { revalidate: 3600, tags: ['reviews'] }
);

export const getAverageRating = async (productId: string): Promise<{ average: number; count: number }> => {
  if (process.env.NODE_ENV === 'development') {
    return fetchAverageRating(productId);
  }
  return cachedAverageRating(productId);
};

// 7. Fetch top approved reviews for landing page grid
const fetchTopReviews = async (limit: number = 8): Promise<(Review & { productName?: string; productSlug?: string })[]> => {
  const { data, error } = await staticSupabase
    .from('reviews')
    .select('*, products(name, slug)')
    .eq('approved', true)
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapReview(row),
    productName: row.products?.name || undefined,
    productSlug: row.products?.slug || undefined
  }));
};

const cachedTopReviews = unstable_cache(
  async (limit: number) => fetchTopReviews(limit),
  ['top-reviews-list'],
  { revalidate: 3600, tags: ['reviews'] }
);

export const getTopReviews = async (limit: number = 8): Promise<(Review & { productName?: string; productSlug?: string })[]> => {
  if (process.env.NODE_ENV === 'development') {
    return fetchTopReviews(limit);
  }
  return cachedTopReviews(limit);
};
