const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/shoaib/Desktop/Zaynahs e-store/.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No database connection string found');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const sql = `
      -- Create size_guides table
      CREATE TABLE IF NOT EXISTS size_guides (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        chart_data JSONB NOT NULL DEFAULT '[]',
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

      -- Policies for size_guides
      DROP POLICY IF EXISTS "Public read size guides" ON size_guides;
      CREATE POLICY "Public read size guides" ON size_guides FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Admin all size guides" ON size_guides;
      CREATE POLICY "Admin all size guides" ON size_guides FOR ALL USING (auth.role() = 'authenticated');

      -- Add size_guide_id to products
      ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide_id UUID REFERENCES size_guides(id) ON DELETE SET NULL;
    `;

    console.log('Executing Size Guides table creation...');
    await client.query(sql);
    console.log('Size Guides migration applied successfully.');
  } catch (err) {
    console.error('Error executing migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
