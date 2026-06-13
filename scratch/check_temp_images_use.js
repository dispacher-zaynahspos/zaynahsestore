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
  const urls = [
    'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/products/temp-product-id/12_1780826623713.webp',
    'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/products/temp-product-id/13_1780826623653.webp',
    'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/products/temp-product-id/14_1780826623933.webp',
    'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/products/temp-product-id/15_1780826623596.webp',
  ];

  for (const url of urls) {
    console.log(`\nChecking URL: ${url}`);
    
    const { data: pImgs, error: e1 } = await supabaseAdmin
      .from('product_images')
      .select('id, product_id, products ( name )')
      .eq('url', url);
    console.log('product_images:', pImgs);

    const { data: pVars, error: e2 } = await supabaseAdmin
      .from('product_variants')
      .select('id, color, size, product_id, products ( name )')
      .eq('image_url', url);
    console.log('product_variants:', pVars);
  }
}

run().catch(console.error);
