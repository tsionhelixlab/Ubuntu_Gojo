const { Pool } = require('pg');
require('dotenv').config();
console.log("DB password loaded:", typeof process.env.DB_PASSWORD, !!process.env.DB_PASSWORD);
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
pool.on('error', err => console.error('Unexpected PostgreSQL error:', err.message));
module.exports = pool;
