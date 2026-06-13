const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // 1. Fetch settings
  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', '00000000-0000-4000-8000-000000000001')
    .single();
    
  if (settingsError) {
    console.error('Failed to get settings:', settingsError);
    return;
  }
  
  console.log('SMTP Configured Email:', settings.smtp_email);
  console.log('SMTP App Password exists:', !!settings.smtp_app_password);
  console.log('Admin Notification Email:', settings.admin_notification_email);
  
  if (!settings.smtp_email || !settings.smtp_app_password) {
    console.error('SMTP not configured in database settings.');
    return;
  }

  // 2. Setup transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.smtp_email,
      pass: settings.smtp_app_password.replace(/\s+/g, ''),
    },
  });

  // 3. Try to send to an external recipient (e.g. shoaibzaynah@gmail.com)
  const recipient = 'shoaibzaynah@gmail.com';
  console.log(`Attempting to send test email to: ${recipient}`);

  try {
    const info = await transporter.sendMail({
      from: `"${settings.smtp_from_name || settings.storeName}" <${settings.smtp_email}>`,
      to: recipient,
      subject: 'Test Email from Zaynahs Storefront',
      html: '<p>This is a test email to verify SMTP delivery to external customer address.</p>'
    });
    console.log('Email sent successfully!', info.messageId);
  } catch (err) {
    console.error('SMTP delivery failed:', err);
  }
}

run();
