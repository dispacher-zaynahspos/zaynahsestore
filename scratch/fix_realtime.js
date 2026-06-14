const { Client } = require('pg');

const connectionString = "postgresql://postgres.jqwqgiqfvjdxaohzvjuv:q5nX13UF36gKR3DV@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  // Ensure publication exists
  try {
    await client.query("CREATE PUBLICATION supabase_realtime;");
    console.log("Created publication supabase_realtime.");
  } catch (err) {
    console.log("Publication supabase_realtime already exists or could not be created:", err.message);
  }

  // Ensure orders is in the publication
  try {
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE orders;");
    console.log("Added orders to supabase_realtime publication.");
  } catch (err) {
    console.log("Could not add orders table (it might already be in publication):", err.message);
  }

  // Ensure abandoned_carts is in the publication
  try {
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE abandoned_carts;");
    console.log("Added abandoned_carts to supabase_realtime publication.");
  } catch (err) {
    console.log("Could not add abandoned_carts table (it might already be in publication):", err.message);
  }

  // Add address fields to abandoned_carts table
  try {
    await client.query(`
      ALTER TABLE abandoned_carts
        ADD COLUMN IF NOT EXISTS customer_address TEXT,
        ADD COLUMN IF NOT EXISTS customer_city TEXT,
        ADD COLUMN IF NOT EXISTS customer_apartment TEXT,
        ADD COLUMN IF NOT EXISTS customer_postal_code TEXT;
    `);
    console.log("Added customer_address, customer_city, customer_apartment, customer_postal_code columns to abandoned_carts table.");
  } catch (err) {
    console.log("Error adding columns to abandoned_carts table:", err.message);
  }

  await client.end();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
