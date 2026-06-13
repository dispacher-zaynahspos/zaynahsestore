const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { onOrderStatusChange } = require('../lib/email/triggers');
  
  // 1. Fetch order ZE-0007
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', 'ZE-0007')
    .single();
    
  if (orderError) {
    console.error('Error fetching order:', orderError);
    return;
  }
  
  const mappedOrder = {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    customerName: orderRow.customer_name,
    customerPhone: orderRow.customer_phone,
    customerId: orderRow.customer_id,
    items: orderRow.items,
    subtotal: parseFloat(orderRow.subtotal || '0'),
    total: parseFloat(orderRow.total || '0'),
    status: orderRow.status,
    notes: orderRow.notes,
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at
  };

  console.log('Mapped Order:', mappedOrder.orderNumber, 'Status:', mappedOrder.status, 'Cust ID:', mappedOrder.customerId);

  // 2. Trigger status change email
  console.log('Triggering onOrderStatusChange for order confirmation...');
  try {
    await onOrderStatusChange(
      mappedOrder, 
      { name: mappedOrder.customerName, phone: mappedOrder.customerPhone }, 
      'confirmed'
    );
    console.log('onOrderStatusChange finished execution.');
  } catch (err) {
    console.error('Trigger error:', err);
  }
}

run();
