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
    .select('*')
    .eq('slug', 'toddler-cotton-romper')
    .single();

  if (error) {
    console.error('Error fetching romper:', error);
    return;
  }

  console.log('Product Details:');
  console.log('  ID:', product.id);
  console.log('  Name:', product.name);
  console.log('  Slug:', product.slug);
  console.log('  Updated At:', product.updated_at);

  const { data: images, error: imgError } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', product.id);

  if (imgError) {
    console.error('Error fetching product images:', imgError);
    return;
  }

  console.log('\nImages in product_images:');
  images.forEach(img => {
    console.log(JSON.stringify(img, null, 2));
  });
}

run().catch(console.error);
