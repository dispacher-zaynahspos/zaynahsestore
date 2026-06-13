const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  const productId = '5720cc5c-acec-404d-9d38-900b70129cba';

  console.log('--- PRODUCT INFO ---');
  const prodRes = await client.query('SELECT id, name, price, compare_price, has_variants FROM products WHERE id = $1', [productId]);
  console.log(prodRes.rows[0]);

  console.log('--- VARIANTS INFO ---');
  const varRes = await client.query('SELECT id, color, size, price, compare_price, active FROM product_variants WHERE product_id = $1', [productId]);
  console.log(varRes.rows);

  await client.end();
}

run();
