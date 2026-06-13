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
  console.log('Listing files in product-images bucket...');
  const { data: files, error } = await supabaseAdmin.storage
    .from('product-images')
    .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  console.log(`Found ${files.length} files in bucket:`);
  files.forEach(f => {
    console.log(`  - Name: ${f.name}, Size: ${f.metadata?.size} bytes, Created: ${f.created_at}`);
  });
}

run().catch(console.error);
