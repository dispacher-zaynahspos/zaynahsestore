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
  console.log('Fetching all products...');
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, active, updated_at');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} total products. Checking their images...`);
  
  for (const product of products) {
    const { data: images, error: imgError } = await supabaseAdmin
      .from('product_images')
      .select('*')
      .eq('product_id', product.id);

    if (imgError) {
      console.error(`Error for product ${product.name}:`, imgError);
      continue;
    }

    const imageCount = images.length;
    const activeText = product.active ? 'Active' : 'Inactive';
    
    // Check if any image fails
    let hasBroken = false;
    let imgInfo = [];
    
    for (const img of images) {
      let statusText = '';
      try {
        const res = await fetch(img.url, { method: 'HEAD' });
        statusText = `${res.status} ${res.statusText}`;
        if (res.status === 404) {
          hasBroken = true;
        }
      } catch (err) {
        statusText = `Error: ${err.message}`;
        hasBroken = true;
      }
      imgInfo.push(`    - URL: ${img.url} [Status: ${statusText}, Primary: ${img.is_primary}]`);
    }

    if (hasBroken || imageCount === 0) {
      console.log(`\n[PROBLEM] Product: ${product.name} (Slug: ${product.slug}, State: ${activeText}, Images Count: ${imageCount})`);
      imgInfo.forEach(info => console.log(info));
    } else {
      console.log(`[OK] Product: ${product.name} (${imageCount} images, all loaded)`);
    }
  }
}

run().catch(console.error);
