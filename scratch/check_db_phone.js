const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('whatsapp_number, social_whatsapp, header_top_bar_phone')
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
  } else {
    console.log("Store settings WhatsApp info:");
    console.log("whatsapp_number:", data.whatsapp_number);
    console.log("social_whatsapp:", data.social_whatsapp);
    console.log("header_top_bar_phone:", data.header_top_bar_phone);
  }
}

checkSettings();
