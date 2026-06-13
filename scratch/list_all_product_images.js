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
  const { data: images, error } = await supabaseAdmin
    .from('product_images')
    .select('*, products ( name )')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching images:', error);
    return;
  }

  console.log(`Found ${images.length} entries in product_images:`);
  images.forEach(img => {
    console.log(`- ID: ${img.id}`);
    console.log(`  Product: ${img.products?.name} (ID: ${img.product_id})`);
    console.log(`  URL: ${img.url}`);
    console.log(`  is_primary: ${img.is_primary}`);
  });
}

run().catch(console.error);
