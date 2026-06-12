import { mapProductToMeta } from './mapProduct';
import { getSettings } from '@/lib/services/settings';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product } from '@/lib/types';

/**
 * Syncs a single product (including its variants) to Meta Catalog.
 */
export async function syncProductToMeta(
  product: Product,
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; error?: any }> {
  try {
    const catalogId = process.env.META_CATALOG_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

    if (!catalogId || !accessToken) {
      const errMsg = 'Meta Catalog ID or Access Token is missing in environment variables.';
      console.warn(`[MetaSync] ${errMsg}`);
      
      // Update database status to error
      await supabaseAdmin
        .from('products')
        .update({
          meta_sync_status: 'error',
          meta_sync_error: errMsg
        })
        .eq('id', product.id);
        
      return { success: false, error: errMsg };
    }

    // 1. Fetch category mapping configuration
    const { data: mappings } = await supabaseAdmin
      .from('meta_category_mapping')
      .select('store_category_id, meta_category');
      
    const categoryMap: Record<string, string> = {};
    if (mappings) {
      mappings.forEach(m => {
        categoryMap[m.store_category_id] = m.meta_category;
      });
    }

    // 2. Fetch global shop configuration settings
    const settings = await getSettings();

    // 3. Build requests payload
    let requests: any[] = [];

    if (action === 'DELETE') {
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        requests = product.variants.map(v => ({
          method: 'DELETE',
          retailer_id: v.id
        }));
      } else {
        requests = [{
          method: 'DELETE',
          retailer_id: product.id
        }];
      }
    } else {
      // If product is inactive, delete it from Meta catalog (soft-delete mapping)
      if (!product.active) {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          requests = product.variants.map(v => ({
            method: 'DELETE',
            retailer_id: v.id
          }));
        } else {
          requests = [{
            method: 'DELETE',
            retailer_id: product.id
          }];
        }
      } else {
        const mappedItems = mapProductToMeta(product, settings, categoryMap);
        requests = mappedItems.map(item => ({
          method: 'UPDATE',
          retailer_id: item.retailer_id,
          data: item
        }));
      }
    }

    if (requests.length === 0) {
      return { success: true };
    }

    // 4. Send API request
    const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
    const response = await fetch(`${url}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    const result = await response.json();

    if (result.error) {
      const errDetail = result.error.message || JSON.stringify(result.error);
      console.error('[MetaSync] Graph API error:', errDetail);
      
      await supabaseAdmin
        .from('products')
        .update({
          meta_sync_status: 'error',
          meta_sync_error: errDetail
        })
        .eq('id', product.id);

      return { success: false, error: errDetail };
    }

    // Successful sync: update product record
    await supabaseAdmin
      .from('products')
      .update({
        meta_sync_status: 'synced',
        meta_sync_error: null,
        meta_last_synced_at: new Date().toISOString()
      })
      .eq('id', product.id);

    console.log(`[MetaSync] Product ${product.id} synced successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`[MetaSync] Failed to sync product ${product.id}:`, error);
    
    await supabaseAdmin
      .from('products')
      .update({
        meta_sync_status: 'error',
        meta_sync_error: error.message || 'Unknown error occurred during sync.'
      })
      .eq('id', product.id);
      
    return { success: false, error };
  }
}

/**
 * Performs bulk synchronization of multiple products to Meta in chunks of 50.
 */
export async function bulkSyncProductsToMeta(
  products: Product[],
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; totalSynced: number; errors: string[] }> {
  const catalogId = process.env.META_CATALOG_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

  if (!catalogId || !accessToken) {
    const errMsg = 'Meta Catalog ID or Access Token is missing in environment variables.';
    return { success: false, totalSynced: 0, errors: [errMsg] };
  }

  try {
    // 1. Fetch category mappings
    const { data: mappings } = await supabaseAdmin
      .from('meta_category_mapping')
      .select('store_category_id, meta_category');
      
    const categoryMap: Record<string, string> = {};
    if (mappings) {
      mappings.forEach(m => {
        categoryMap[m.store_category_id] = m.meta_category;
      });
    }

    // 2. Fetch settings
    const settings = await getSettings();

    // 3. Build all requests
    const allRequests: any[] = [];
    const productIds: string[] = [];

    for (const product of products) {
      productIds.push(product.id);
      let requests: any[] = [];
      if (action === 'DELETE' || !product.active) {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          requests = product.variants.map(v => ({
            method: 'DELETE',
            retailer_id: v.id
          }));
        } else {
          requests = [{
            method: 'DELETE',
            retailer_id: product.id
          }];
        }
      } else {
        const mappedItems = mapProductToMeta(product, settings, categoryMap);
        requests = mappedItems.map(item => ({
          method: 'UPDATE',
          retailer_id: item.retailer_id,
          data: item
        }));
      }
      allRequests.push(...requests);
    }

    if (allRequests.length === 0) {
      return { success: true, totalSynced: 0, errors: [] };
    }

    // 4. Batch submit requests in chunks of 50
    const chunkSize = 50;
    const errors: string[] = [];
    let totalSynced = 0;

    for (let i = 0; i < allRequests.length; i += chunkSize) {
      const chunk = allRequests.slice(i, i + chunkSize);
      
      const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
      const response = await fetch(`${url}?access_token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: chunk })
      });

      const result = await response.json();

      if (result.error) {
        errors.push(result.error.message || JSON.stringify(result.error));
      } else {
        totalSynced += chunk.length;
      }
    }

    // 5. Update statuses in DB
    if (errors.length === 0) {
      await supabaseAdmin
        .from('products')
        .update({
          meta_sync_status: 'synced',
          meta_sync_error: null,
          meta_last_synced_at: new Date().toISOString()
        })
        .in('id', productIds);
    } else {
      await supabaseAdmin
        .from('products')
        .update({
          meta_sync_status: 'error',
          meta_sync_error: errors[0]
        })
        .in('id', productIds);
    }

    return { success: errors.length === 0, totalSynced, errors };
  } catch (error: any) {
    console.error('[MetaSync] Bulk sync failed:', error);
    return { success: false, totalSynced: 0, errors: [error.message || 'Unknown error'] };
  }
}
