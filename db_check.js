const { Client } = require('pg');

const configs = [
  {
    name: 'Regional Pooler - Transaction (6543)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.xqdwmrfoaxquorqkzoxf',
    password: 'Nikhil@150528#',
    database: 'postgres'
  },
  {
    name: 'Regional Pooler - Session (5432)',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.xqdwmrfoaxquorqkzoxf',
    password: 'Nikhil@150528#',
    database: 'postgres'
  },
  {
    name: 'Direct IPv6 - (Might fail if no IPv6 support)',
    host: 'db.xqdwmrfoaxquorqkzoxf.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Nikhil@150528#',
    database: 'postgres'
  }
];

async function check(config) {
  console.log(`\n--- Testing: ${config.name} ---`);
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const start = Date.now();
    await client.connect();
    const end = Date.now();
    console.log(`✅ Success! Connection took ${end - start}ms`);
    const res = await client.query('SELECT version()');
    console.log(`🔹 DB Version: ${res.rows[0].version.split(',')[0]}`);
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    if (err.code) console.log(`   Code: ${err.code}`);
    if (err.address) console.log(`   Address: ${err.address}`);
  } finally {
    await client.end().catch(() => {});
  }
}

async function runAll() {
  for (const c of configs) {
    await check(c);
  }
}

runAll();
