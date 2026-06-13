const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', 'ZE-0008')
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Order ZE-0008 raw fields:');
  console.log(JSON.stringify(order, null, 2));
}

run();
