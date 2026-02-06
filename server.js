const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server config
const config = {
  server: 'DESKTOP-2I8VKSG',   // 👈 your SQL Server name or localhost
  database: 'db1',
  options: {
    encrypt: false,              // disable encryption for local dev
    trustServerCertificate: true // accept self-signed certs
  },
  authentication: {
    type: 'default',             // 👈 use SQL login, not Windows
    options: {
      userName: 'myuser',        // 👈 your SQL login
      password: 'MyPassword123'  // 👈 your SQL password
    }
  }
};

// Create a connection pool
const poolPromise = sql.connect(config).then(pool => {
  console.log('✅ Connected to SQL Server');
  return pool;
}).catch(err => {
  console.error('❌ Database connection failed', err);
});

// Example endpoint
app.get('/timestats', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        Title AS title,
        CurrentHours AS current,
        PreviousHours AS previous
      FROM TimeStats
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Query failed', err);
    res.status(500).send('Database query failed');
  }
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
