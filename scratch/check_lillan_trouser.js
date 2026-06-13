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
  const targetUrl = 'https://jqwqgiqfvjdxaohzvjuv.supabase.co/storage/v1/object/public/product-images/lillan-trouser---5-1781302210701.webp';
  
  console.log('Querying product_images table for URL...');
  const { data: prodImgs, error: err1 } = await supabaseAdmin
    .from('product_images')
    .select('*, products ( name )')
    .eq('url', targetUrl);

  if (err1) {
    console.error('Error querying product_images:', err1);
  } else {
    console.log('product_images results:', JSON.stringify(prodImgs, null, 2));
  }

  console.log('\nQuerying media_library table for URL...');
  const { data: mediaItems, error: err2 } = await supabaseAdmin
    .from('media_library')
    .select('*')
    .eq('file_url', targetUrl);

  if (err2) {
    console.error('Error querying media_library:', err2);
  } else {
    console.log('media_library results:', JSON.stringify(mediaItems, null, 2));
  }
}

run().catch(console.error);
