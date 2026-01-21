const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'data_sharing_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Test Connection
db.query('SELECT 1')
  .then(() => console.log('✅ MySQL Database Connected Successfully!'))
  .catch(err => console.error('❌ Database Connection Failed:', err.message));

module.exports = db;