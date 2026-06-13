const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, customer_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    return;
  }
  
  console.log('--- Recent Orders ---');
  for (const order of orders) {
    let customerInfo = { email: 'N/A', name: 'N/A', phone: 'N/A' };
    if (order.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('email, name, phone')
        .eq('id', order.customer_id)
        .maybeSingle();
      if (customer) {
        customerInfo = customer;
      }
    }
    console.log(`Order: ${order.order_number} | DB Cust Name: ${order.customer_name} | Cust ID: ${order.customer_id}`);
    console.log(`   Customer Table Email: ${customerInfo.email} | Phone: ${customerInfo.phone} | Name: ${customerInfo.name}`);
    console.log('----------------------------------------------------');
  }
}

run();
