const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.xqdwmrfoaxquorqkzoxf',
    password: 'Nikhil@150528#',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.connect();
    console.log('Connected to Supabase. Applying schema...');
    
    // Split by semicolon might be naive if there are semicolons in strings/functions,
    // but for simple DDL it usually works. Better to send as one block if PG supports it.
    await client.query(sql);
    
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
