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
    .select('id, color, size, image_url')
    .eq('product_id', '5720cc5c-acec-404d-9d38-900b70129cba');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${variants.length} variants:`);
  const colors = {};
  for (const v of variants) {
    if (!colors[v.color]) {
      colors[v.color] = [];
    }
    colors[v.color].push({ size: v.size, image_url: v.image_url });
  }

  for (const [color, list] of Object.entries(colors)) {
    console.log(`\nColor: ${color}`);
    console.log(`Sample Image URL: "${list[0].image_url}"`);
    console.log(`Sizes: ${list.map(x => x.size).join(', ')}`);
  }
}

run().catch(console.error);
