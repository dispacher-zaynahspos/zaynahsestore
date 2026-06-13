const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const customerName = 'Dbmail mail';
  const customerPhone = '0302777777';
  const customerEmail = 'dbmailmail4@gmail.com';

  console.log('Testing guest customer auto-creation logic:');
  try {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    console.log('cleanPhone:', cleanPhone);
    
    // 1. Query by raw phone number (as done in createOrder)
    const { data: existingCustomer, error: queryError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customerPhone)
      .maybeSingle();

    if (queryError) {
      console.error('Query error:', queryError);
    }
    
    console.log('existingCustomer found:', existingCustomer);

    if (existingCustomer) {
      const customerId = existingCustomer.id;
      console.log('Existing customer ID:', customerId);
      if (customerEmail) {
        console.log('Updating existing customer email to:', customerEmail);
        const { data, error: updateError } = await supabase
          .from('customers')
          .update({ email: customerEmail })
          .eq('id', customerId)
          .select('*');
        if (updateError) {
          console.error('Update error:', updateError);
        } else {
          console.log('Update success:', data);
        }
      }
    } else {
      console.log('No existing customer found. Creating new guest account...');
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          name: customerName || 'Guest Customer',
          phone: customerPhone,
          email: customerEmail || null,
          password_hash: null
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
      } else {
        console.log('Insert success:', newCustomer);
      }
    }
  } catch (err) {
    console.error('Caught unexpected error:', err);
  }
}

run();
