const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

async function run() {
  const { data: current, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log('Total columns in store_settings:', Object.keys(current).length);
  console.log(JSON.stringify(Object.keys(current).sort(), null, 2));
}

run();
