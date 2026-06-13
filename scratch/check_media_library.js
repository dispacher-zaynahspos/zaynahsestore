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
  console.log('Querying media_library for canvas-1781309830501.webp...');
  const { data: media, error } = await supabaseAdmin
    .from('media_library')
    .select('*')
    .eq('seo_filename', 'canvas-1781309830501.webp')
    .maybeSingle();

  if (error) {
    console.error('Error fetching media:', error);
    return;
  }

  if (media) {
    console.log('Media library entry found:');
    console.log(JSON.stringify(media, null, 2));
  } else {
    console.log('No media library entry found for canvas-1781309830501.webp');
  }
}

run().catch(console.error);
