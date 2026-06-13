const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

const staticSupabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await staticSupabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('Error in select:', error);
    } else {
      console.log('Success. Data exists:', !!data);
      if (data) {
        console.log('Row ID:', data.id);
        console.log('Store Name:', data.store_name);
      }
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

test();
