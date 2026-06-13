const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

async function run() {
  console.log('Testing settings update query directly in DB...');
  
  // Let's retrieve the current settings first
  const { data: currentSettings, error: fetchError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (fetchError) {
    console.error('Error fetching settings:', fetchError);
    return;
  }

  console.log('Successfully fetched settings row.');

  // Let's try to update a simple field (like store_name) to see if update query works
  const { data, error } = await supabase
    .from('store_settings')
    .update({ store_name: currentSettings.store_name })
    .eq('id', SETTINGS_ID)
    .select('*');

  if (error) {
    console.error('Error on update settings query:', error);
  } else {
    console.log('Update query succeeded! Rows affected:', data.length);
  }
}

run();
