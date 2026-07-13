// create-db.js
require('dotenv').config();
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL non definita in .env');
  process.exit(1);
}

const url = new URL(databaseUrl);
const dbName = url.pathname.slice(1);

const client = new Client({
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: 'postgres'
});

async function createDatabase() {
  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" creato con successo!`);
    } else {
      console.log(`ℹ️ Database "${dbName}" esiste già.`);
    }
  } catch (err) {
    console.error('❌ Errore:', err.message);
    console.error('   Assicurati che PostgreSQL sia in esecuzione');
  } finally {
    await client.end();
  }
}

createDatabase();