const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sqlPath = path.join(__dirname, "../supabase/migrations/20260612110000_add_meta_catalog_sync.sql");

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log("Applying Meta Catalog Sync migration...");
  await client.query(sql);
  console.log("Migration applied successfully!");
  
  await client.end();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
