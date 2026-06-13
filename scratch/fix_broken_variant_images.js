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
  const brokenUrl = 'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/products/library/38_1781066605227.webp';
  
  console.log(`Resetting image_url to null for variants pointing to: ${brokenUrl}`);
  
  const { data: updated, error } = await supabaseAdmin
    .from('product_variants')
    .update({ image_url: null })
    .eq('image_url', brokenUrl)
    .select('id, color, size');

  if (error) {
    console.error('Error updating variants:', error);
    return;
  }

  console.log(`Successfully updated ${updated.length} variants:`);
  updated.forEach(v => {
    console.log(`  - Variant ID: ${v.id} (Color: ${v.color}, Size: ${v.size})`);
  });
}

run().catch(console.error);
