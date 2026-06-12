const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No database connection string found in env');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const sql = `
      ALTER TABLE store_settings
      ADD COLUMN IF NOT EXISTS footer_show_payments BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS footer_show_menu BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS footer_show_newsletter BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS footer_show_social BOOLEAN DEFAULT TRUE;

      -- Sync values for the singleton settings row
      UPDATE store_settings
      SET 
        footer_show_payments = COALESCE(footer_show_payments, TRUE),
        footer_show_menu = COALESCE(footer_show_menu, TRUE),
        footer_show_newsletter = COALESCE(footer_show_newsletter, TRUE),
        footer_show_social = COALESCE(footer_show_social, TRUE)
      WHERE id = '00000000-0000-4000-8000-000000000001';
    `;
    
    console.log('Executing footer visibility SQL migrations...');
    await client.query(sql);
    console.log('Database migrations applied successfully');
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
