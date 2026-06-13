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

async function listFolder(prefix = '') {
  const { data: files, error } = await supabaseAdmin.storage
    .from('product-images')
    .list(prefix, { limit: 100 });

  if (error) {
    console.error(`Error listing folder "${prefix}":`, error);
    return [];
  }

  let results = [];
  for (const file of files) {
    const fullPath = prefix ? `${prefix}/${file.name}` : file.name;
    if (file.id === undefined || file.metadata === null || file.metadata === undefined) {
      // It's a folder, traverse it
      const subFiles = await listFolder(fullPath);
      results = results.concat(subFiles);
    } else {
      results.push({
        path: fullPath,
        size: file.metadata?.size,
        created: file.created_at
      });
    }
  }
  return results;
}

async function run() {
  console.log('Listing all files in product-images bucket recursively...');
  const allFiles = await listFolder();
  console.log(`\nFound ${allFiles.length} files recursively:`);
  allFiles.forEach(f => {
    console.log(`  - Path: ${f.path}`);
    console.log(`    Size: ${f.size} bytes`);
    console.log(`    Created: ${f.created}`);
  });
}

run().catch(console.error);
