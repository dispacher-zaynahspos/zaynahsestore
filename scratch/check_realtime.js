const { Client } = require('pg');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  // Check publications
  const pubs = await client.query("SELECT * FROM pg_publication;");
  console.log("Publications:", pubs.rows);

  // Check tables in supabase_realtime
  const tables = await client.query("SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';");
  console.log("Tables in supabase_realtime:", tables.rows);

  await client.end();
}

main().catch(err => {
  console.error("Check failed:", err);
  process.exit(1);
});
