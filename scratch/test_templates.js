const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  
  // 1. Check store settings
  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('store_settings')
    .select('*')
    .single();
    
  if (settingsError) {
    console.error('Error fetching store settings:', settingsError);
  } else {
    console.log('Store Settings fetched successfully:');
    console.log('  storeName:', settings.store_name);
    console.log('  smtp_email:', settings.smtp_email);
    console.log('  smtp_app_password:', settings.smtp_app_password ? '*** (configured)' : 'not configured');
    console.log('  admin_notification_email:', settings.admin_notification_email);
  }

  // 2. Check email templates count and status
  const { data: templates, error: templatesError } = await supabaseAdmin
    .from('email_templates')
    .select('*');
    
  if (templatesError) {
    console.error('Error fetching email_templates:', templatesError);
  } else {
    console.log(`\nFetched ${templates.length} email templates:`);
    templates.forEach(t => {
      console.log(`  - ${t.email_type} (${t.category}): enabled=${t.enabled}, subject="${t.subject}"`);
    });
  }
}

run().catch(console.error);
