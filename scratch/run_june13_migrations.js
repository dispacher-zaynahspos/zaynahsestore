const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  const migration1 = path.join(__dirname, "../supabase/migrations/20260613122000_add_global_discount_settings.sql");
  const migration2 = path.join(__dirname, "../supabase/migrations/20260613134100_add_media_size_type.sql");

  console.log("Applying Migration 1 (Global Discount)...");
  const sql1 = fs.readFileSync(migration1, 'utf8');
  await client.query(sql1);
  console.log("Migration 1 applied successfully!");

  console.log("Applying Migration 2 (Media Size Type)...");
  const sql2 = fs.readFileSync(migration2, 'utf8');
  await client.query(sql2);
  console.log("Migration 2 applied successfully!");

  await client.end();
}

main().catch(err => {
  console.error("Migrations failed:", err);
  process.exit(1);
});
