const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const migrationFiles = [
  "20260614_abandoned_carts.sql",
  "20260614050000_add_abandoned_cart_settings.sql"
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  for (const filename of migrationFiles) {
    const sqlPath = path.join(__dirname, "../supabase/migrations", filename);
    if (!fs.existsSync(sqlPath)) {
      console.warn(`File ${filename} does not exist at ${sqlPath}`);
      continue;
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`Applying ${filename}...`);
    try {
      await client.query(sql);
      console.log(`${filename} applied successfully!`);
    } catch (err) {
      console.error(`Error applying ${filename}:`, err.message);
      // Don't fail the whole script, continue in case table/columns already exist
    }
  }

  await client.end();
}

main().catch(err => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
