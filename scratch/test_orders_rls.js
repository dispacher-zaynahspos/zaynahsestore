const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing insert into orders table as guest/anon user...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: 'ZE-TEST-ANON-MIGRATE',
        customer_name: 'Anon Customer Test',
        customer_phone: '123456789',
        items: [],
        subtotal: 100,
        total: 100,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Insert failed:', error.message, '(Code:', error.code, ')');
    } else {
      console.log('✅ Insert success:', data);
    }
  } catch (err) {
    console.error('❌ Runtime Error:', err);
  }
}

run();
