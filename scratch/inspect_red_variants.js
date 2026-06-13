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
  const { data: variants, error } = await supabaseAdmin
    .from('product_variants')
    .select('id, color, size, image_url, products ( name )')
    .eq('color', 'Red');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${variants.length} Red variants:`);
  for (const v of variants) {
    console.log(`Variant ID: ${v.id}, Size: ${v.size}`);
    console.log(`URL: "${v.image_url}"`);
  }
}

run().catch(console.error);
