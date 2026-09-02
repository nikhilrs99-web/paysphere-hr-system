const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'db.xqdwmrfoaxquorqkzoxf.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Nikhil@150528#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase.');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
