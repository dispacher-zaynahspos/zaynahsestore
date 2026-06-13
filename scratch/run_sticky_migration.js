const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  const migration = path.join(__dirname, "../supabase/migrations/20260613144500_add_separate_header_sticky.sql");

  console.log("Applying Migration (Separate Header Sticky)...");
  const sql = fs.readFileSync(migration, 'utf8');
  await client.query(sql);
  console.log("Migration applied successfully!");

  await client.end();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
