const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Fetching recently updated products...');
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  for (const product of products) {
    console.log(`\nProduct: ${product.name} (Slug: ${product.slug}, Updated: ${product.updated_at})`);
    
    // Fetch associated product images
    const { data: images, error: imgError } = await supabaseAdmin
      .from('product_images')
      .select('*')
      .eq('product_id', product.id);

    if (imgError) {
      console.error('  Error fetching images:', imgError);
      continue;
    }

    console.log(`  Images in product_images table: ${images.length}`);
    for (const img of images) {
      console.log(`    - ID: ${img.id}`);
      console.log(`      URL: ${img.url}`);
      console.log(`      is_primary: ${img.is_primary}`);
      console.log(`      sort_order: ${img.sort_order}`);
      
      // Perform simple head/fetch request on the URL to see if it loads
      try {
        const res = await fetch(img.url, { method: 'HEAD' });
        console.log(`      HTTP Status: ${res.status} ${res.statusText}`);
      } catch (err) {
        console.log(`      HTTP Fetch Error: ${err.message}`);
      }
    }
  }
}

run().catch(console.error);
