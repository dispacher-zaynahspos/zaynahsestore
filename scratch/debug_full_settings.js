const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

async function run() {
  const { data: current, error: fetchError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log('Current settings keys:', Object.keys(current));

  // Let's try to update all fields using the exact columns in the database
  const updatePayload = {};
  for (const key of Object.keys(current)) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
    updatePayload[key] = current[key];
  }

  console.log('Sending full update payload...');
  const { data, error } = await supabase
    .from('store_settings')
    .update(updatePayload)
    .eq('id', SETTINGS_ID)
    .select('*');

  if (error) {
    console.error('Database update failed:', error);
  } else {
    console.log('Database update succeeded! Rows updated:', data.length);
  }
}

run();
