const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { createOrder } = require('../lib/services/orders');

  console.log('Testing checkout with duplicate email (dbmailmail4@gmail.com)...');
  try {
    const orderData = {
      customerName: 'Dbmail Duplicate Test',
      customerPhone: '0302777777',
      customerEmail: 'dbmailmail4@gmail.com',
      items: [],
      subtotal: 100,
      total: 100,
      notes: 'Test duplicate checkout robust mapping'
    };

    const order = await createOrder(orderData);
    console.log('Order created successfully!');
    console.log('Order Number:', order.orderNumber);
    console.log('Customer ID linked to Order:', order.customerId);

    if (order.customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', order.customerId)
        .single();
      console.log('Associated customer in DB:', customer);
    } else {
      console.error('Test Failed: customerId was null!');
    }

    // Clean up created test order from database
    console.log('Cleaning up test order...');
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('Cleanup done.');

  } catch (err) {
    console.error('Test Failed with Error:', err);
  }
}

run();
