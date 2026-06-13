import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { callAI, getAISettings } from '@/lib/aiEngine';
import { buildSystemPrompt, buildSEOPrompt } from '@/lib/seoPrompts';
import { pingIndexNow } from '@/lib/indexNow';

export async function POST(request: Request) {
  try {
    const { entity_type, entity_id, title, context } = await request.json();

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    // 1. Fetch entity details from DB for context
    let entityData: any = {};
    let slug = '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaynahs.pk';

    if (entity_type === 'product') {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('name, description, price, slug')
        .eq('id', entity_id)
        .single();
      
      if (error || !data) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      entityData = {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: 'PKR',
        stock: 10, // fallback stock
      };
      slug = data.slug;
    } else if (entity_type === 'category') {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('name, description, slug')
        .eq('id', entity_id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      entityData = {
        name: data.name,
        description: data.description,
      };
      slug = data.slug;
    } else {
      // generic page type
      entityData = {
        title: title || 'Page',
        description: context || '',
      };
      slug = entity_id; // page slug passed as entity_id
    }

    // 2. Fetch Central AI Settings
    const settings = await getAISettings();

    // 3. Build Prompts
    const systemPrompt = buildSystemPrompt(settings);
    const userPrompt = buildSEOPrompt(entity_type, entityData);

    // 4. Invoke LLM via Key Rotation Engine
    const rawResult = await callAI(userPrompt, systemPrompt, false);

    // 5. Parse JSON response (cleans thinking tags or markdown code block wrapper if present)
    let cleanJsonStr = rawResult.trim();
    if (cleanJsonStr.includes('```json')) {
      cleanJsonStr = cleanJsonStr.split('```json')[1].split('```')[0].trim();
    } else if (cleanJsonStr.includes('```')) {
      cleanJsonStr = cleanJsonStr.split('```')[1].split('```')[0].trim();
    }

    let seoData: any;
    try {
      seoData = JSON.parse(cleanJsonStr);
    } catch (parseError) {
      console.error('[SEO Optimize] JSON Parse Error. Raw output was:', rawResult);
      return NextResponse.json({ 
        error: 'AI response was not valid JSON', 
        raw: rawResult 
      }, { status: 500 });
    }

    // 6. Save/Upsert to seo_meta table
    const { error: upsertError } = await supabaseAdmin
      .from('seo_meta')
      .upsert({
        entity_type,
        entity_id,
        seo_title: seoData.seo_title,
        meta_description: seoData.meta_description,
        focus_keyword: seoData.focus_keyword,
        secondary_keywords: seoData.secondary_keywords,
        lsi_tags: seoData.lsi_tags,
        og_title: seoData.og_title,
        og_description: seoData.og_description,
        twitter_title: seoData.twitter_title,
        twitter_description: seoData.twitter_description,
        image_alt: seoData.image_alt,
        long_description: seoData.long_description,
        faq_schema: seoData.faq_schema || [],
        pinterest_description: seoData.pinterest_description,
        is_optimized: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'entity_type,entity_id'
      });

    if (upsertError) {
      console.error('[SEO Optimize] DB Upsert Error:', upsertError);
      return NextResponse.json({ error: 'Failed to save SEO metadata to database' }, { status: 500 });
    }

    // 7. Ping IndexNow API
    const targetUrl = entity_type === 'product'
      ? `${siteUrl}/product/${slug}`
      : entity_type === 'category'
      ? `${siteUrl}/category/${slug}`
      : `${siteUrl}/${slug}`;
    
    await pingIndexNow([targetUrl]);

    // Also trigger local storefront cache clear if needed
    // revalidatePath / revalidateTag can be hit here
    try {
      const { revalidateTag } = await import('next/cache');
      if (entity_type === 'product') {
        (revalidateTag as any)(`product-${slug}`);
        (revalidateTag as any)('products');
      } else if (entity_type === 'category') {
        (revalidateTag as any)(`category-${slug}`);
        (revalidateTag as any)('categories');
      }
    } catch (revalErr) {
      console.warn('[SEO Optimize] Local revalidation skipped:', revalErr);
    }

    return NextResponse.json({ success: true, data: seoData });
  } catch (error: any) {
    console.error('[SEO Optimize] Optimization failed:', error);
    return NextResponse.json({ error: error.message || 'Optimization process failed' }, { status: 500 });
  }
}
