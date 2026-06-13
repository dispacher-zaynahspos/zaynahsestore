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
  console.log('Fetching all product variants...');
  const { data: variants, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, product_id, color, size, image_url, products ( name )');

  if (error) {
    console.error('Error fetching variants:', error);
    return;
  }

  console.log(`Found ${variants.length} total variants. Checking their images...`);
  
  for (const variant of variants) {
    if (!variant.image_url) {
      console.log(`[NO IMAGE] Variant ID: ${variant.id} (${variant.products?.name} - Color: ${variant.color}, Size: ${variant.size})`);
      continue;
    }
    
    let statusText = '';
    let isBroken = false;
    try {
      const res = await fetch(variant.image_url, { method: 'HEAD' });
      statusText = `${res.status} ${res.statusText}`;
      if (res.status === 404) {
        isBroken = true;
      }
    } catch (err) {
      statusText = `Error: ${err.message}`;
      isBroken = true;
    }
    
    if (isBroken) {
      console.log(`\n[PROBLEM] Variant ID: ${variant.id} (${variant.products?.name} - Color: ${variant.color}, Size: ${variant.size})`);
      console.log(`    - URL: ${variant.image_url} [Status: ${statusText}]`);
    } else {
      console.log(`[OK] Variant ID: ${variant.id} (${variant.products?.name} - Color: ${variant.color}, Size: ${variant.size}) - Status: ${statusText}`);
    }
  }
}

run().catch(console.error);
