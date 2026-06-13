const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSettings() {
  // 1. Fetch current settings
  const { data, error } = await supabase
    .from('store_settings')
    .select('id, whatsapp_number, social_whatsapp, header_top_bar_phone')
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    process.exit(1);
  }

  console.log("Current database values:");
  console.log("whatsapp_number:", data.whatsapp_number);
  console.log("social_whatsapp:", data.social_whatsapp);

  // Fix whatsapp_number to 923284114551 if it is 92284114551
  let updatedWhatsapp = data.whatsapp_number;
  if (data.whatsapp_number === '92284114551') {
    updatedWhatsapp = '923284114551';
  }

  // Fix social_whatsapp to 923027245937 if it is 03027245937
  let updatedSocial = data.social_whatsapp;
  if (data.social_whatsapp === '03027245937') {
    updatedSocial = '923027245937';
  } else if (data.social_whatsapp && data.social_whatsapp.startsWith('0')) {
    updatedSocial = '92' + data.social_whatsapp.slice(1);
  }

  console.log("\nProposed updates:");
  console.log("whatsapp_number:", updatedWhatsapp);
  console.log("social_whatsapp:", updatedSocial);

  const { error: updateError } = await supabase
    .from('store_settings')
    .update({
      whatsapp_number: updatedWhatsapp,
      social_whatsapp: updatedSocial
    })
    .eq('id', data.id);

  if (updateError) {
    console.error("Error updating settings:", updateError);
  } else {
    console.log("Successfully updated settings in DB!");
  }
}

fixSettings();
