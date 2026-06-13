const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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
  const { data: settings } = await supabaseAdmin.from('store_settings').select('*').single();
  const { data: template } = await supabaseAdmin.from('email_templates').select('*').eq('email_type', 'order_placed').single();
  
  if (!settings.smtp_email || !settings.smtp_app_password) {
    console.error('SMTP settings missing');
    return;
  }

  const to = settings.admin_notification_email || settings.smtp_email;
  console.log(`Sending templated email to: ${to}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.smtp_email,
      pass: settings.smtp_app_password.replace(/\s+/g, ''),
    },
  });

  const subject = template.subject.replace('{{order_id}}', 'TEST1234');
  const html = template.custom_html || `<h2>Order Confirmation</h2><p>Your order TEST1234 is placed.</p>`;

  const info = await transporter.sendMail({
    from: `"${settings.smtp_from_name || settings.store_name}" <${settings.smtp_email}>`,
    to,
    subject,
    html,
  });

  console.log('Success! Message ID:', info.messageId);
}

run().catch(console.error);
