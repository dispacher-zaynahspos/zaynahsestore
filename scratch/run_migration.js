const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function run() {
  const sqlFile = path.join(__dirname, '../supabase/migrations/20260614001000_add_orders_public_insert.sql');
  console.log('Reading migration file:', sqlFile);
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to database...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Executing migration...');
    await client.query(sql);
    console.log('✅ Migration executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
