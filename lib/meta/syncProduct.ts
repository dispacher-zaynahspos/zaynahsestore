import { mapProductToMeta } from './mapProduct';
import { getSettings } from '@/lib/services/settings';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product } from '@/lib/types';

/**
 * Writes sync result to meta_sync_log table ONLY.
 * NEVER writes to products table — avoids infinite webhook loop.
 */
async function logSyncResult(
  productId: string,
  status: 'synced' | 'error' | 'skipped',
  action: 'UPDATE' | 'DELETE',
  error?: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('meta_sync_log')
      .insert({
        product_id: productId,
        status,
        action,
        error: error ?? null,
      });
  } catch (logErr) {
    // Log failure is non-fatal — don't throw
    console.error('[MetaSync] Failed to write to meta_sync_log:', logErr);
  }
}

/**
 * Syncs a single product (including its variants) to Meta Catalog.
 * Results are written to meta_sync_log — NOT to products table.
 */
export async function syncProductToMeta(
  product: Product,
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; error?: any }> {
  try {
    if (process.env.DISABLE_META_SYNC === 'true') {
      console.log('[MetaSync] Meta sync is temporarily disabled via env variable.');
      return { success: true };
    }

    const catalogId = process.env.META_CATALOG_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

    if (!catalogId || !accessToken) {
      const errMsg = 'Meta Catalog ID or Access Token is missing in environment variables.';
      console.warn(`[MetaSync] ${errMsg}`);
      await logSyncResult(product.id, 'error', action, errMsg);
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
        requests = [{ method: 'DELETE', retailer_id: product.id }];
      }
    } else {
      // Inactive product → delete from Meta catalog
      if (!product.active) {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          requests = product.variants.map(v => ({
            method: 'DELETE',
            retailer_id: v.id
          }));
        } else {
          requests = [{ method: 'DELETE', retailer_id: product.id }];
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
      await logSyncResult(product.id, 'skipped', action);
      return { success: true };
    }

    // 4. Send API request to Meta Graph API
    const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
    const response = await fetch(`${url}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });

    const result = await response.json();

    if (result.error) {
      const errDetail = result.error.message || JSON.stringify(result.error);
      console.error('[MetaSync] Graph API error:', errDetail);
      await logSyncResult(product.id, 'error', action, errDetail);
      return { success: false, error: errDetail };
    }

    // ✅ Success — write ONLY to meta_sync_log, NOT to products table
    await logSyncResult(product.id, 'synced', action);
    console.log(`[MetaSync] Product ${product.id} synced successfully.`);
    return { success: true };

  } catch (error: any) {
    console.error(`[MetaSync] Failed to sync product ${product.id}:`, error);
    await logSyncResult(product.id, 'error', action, error.message || 'Unknown error occurred during sync.');
    return { success: false, error };
  }
}

/**
 * Performs bulk synchronization of multiple products to Meta in chunks of 50.
 * Results are written to meta_sync_log — NOT to products table.
 */
export async function bulkSyncProductsToMeta(
  products: Product[],
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; totalSynced: number; errors: string[] }> {
  if (process.env.DISABLE_META_SYNC === 'true') {
    console.log('[MetaSync] Bulk sync is temporarily disabled via env variable.');
    return { success: true, totalSynced: 0, errors: [] };
  }

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

    // 3. Build all requests + track which productId maps to what
    const allRequests: any[] = [];
    const productIdForChunk: string[] = [];

    for (const product of products) {
      let requests: any[] = [];
      if (action === 'DELETE' || !product.active) {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          requests = product.variants.map(v => ({ method: 'DELETE', retailer_id: v.id }));
        } else {
          requests = [{ method: 'DELETE', retailer_id: product.id }];
        }
      } else {
        const mappedItems = mapProductToMeta(product, settings, categoryMap);
        requests = mappedItems.map(item => ({
          method: 'UPDATE',
          retailer_id: item.retailer_id,
          data: item
        }));
      }
      requests.forEach(() => productIdForChunk.push(product.id));
      allRequests.push(...requests);
    }

    if (allRequests.length === 0) {
      return { success: true, totalSynced: 0, errors: [] };
    }

    // 4. Batch submit in chunks of 50
    const chunkSize = 50;
    const errors: string[] = [];
    let totalSynced = 0;
    const successProductIds = new Set<string>();
    const errorProductIds = new Set<string>();

    for (let i = 0; i < allRequests.length; i += chunkSize) {
      const chunk = allRequests.slice(i, i + chunkSize);
      const chunkProductIds = productIdForChunk.slice(i, i + chunkSize);

      const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
      const response = await fetch(`${url}?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: chunk })
      });

      const result = await response.json();

      if (result.error) {
        const errMsg = result.error.message || JSON.stringify(result.error);
        errors.push(errMsg);
        chunkProductIds.forEach(id => errorProductIds.add(id));
      } else {
        totalSynced += chunk.length;
        chunkProductIds.forEach(id => successProductIds.add(id));
      }
    }

    // 5. ✅ Write results ONLY to meta_sync_log — NOT to products table
    const logRows: any[] = [];
    successProductIds.forEach(id => {
      // Don't double-log as error
      if (!errorProductIds.has(id)) {
        logRows.push({ product_id: id, status: 'synced', action });
      }
    });
    errorProductIds.forEach(id => {
      logRows.push({ product_id: id, status: 'error', action, error: errors[0] || 'Unknown error' });
    });

    if (logRows.length > 0) {
      await supabaseAdmin.from('meta_sync_log').insert(logRows);
    }

    return { success: errors.length === 0, totalSynced, errors };
  } catch (error: any) {
    console.error('[MetaSync] Bulk sync failed:', error);
    return { success: false, totalSynced: 0, errors: [error.message || 'Unknown error'] };
  }
}
