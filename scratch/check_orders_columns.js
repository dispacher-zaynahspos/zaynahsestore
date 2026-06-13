const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'orders' }); // fallback to query if RPC not exists
    
  if (error) {
    console.log('RPC check failed (normal if function not exists). Querying single order instead...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single();
      
    if (orderError) {
      console.error('Error fetching order:', orderError);
    } else {
      console.log('Order columns found:', Object.keys(order));
    }
  } else {
    console.log('RPC columns:', data);
  }
}

run();
