const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.xqdwmrfoaxquorqkzoxf',
    password: 'Nikhil@150528#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Testing connection to Supabase Pooler...');
    await client.connect();
    console.log('Successfully connected to Supabase Pooler.');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
  } catch (err) {
    console.error('Pooler Connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
