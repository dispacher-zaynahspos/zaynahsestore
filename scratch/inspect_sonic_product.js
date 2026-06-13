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
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('id, name, slug')
    .eq('name', 'Kids Sonic "Game On" Graphic Cotton T-Shirt')
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return;
  }

  console.log('Product details:', product);

  console.log('\nFetching images from product_images table...');
  const { data: images, error: imagesError } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', product.id);

  if (imagesError) {
    console.error('Error fetching images:', imagesError);
    return;
  }

  console.log(`Found ${images.length} images:`);
  for (const img of images) {
    console.log(`- ID: ${img.id}`);
    console.log(`  URL: ${img.url}`);
    console.log(`  Primary: ${img.is_primary}`);
  }
}

run().catch(console.error);
