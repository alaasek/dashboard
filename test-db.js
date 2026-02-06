const sql = require('mssql');

const config = {
  server: 'DESKTOP-2I8VKSG', // Your server name
  database: 'db1',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: 'DESKTOP-2I8VKSG', // Your machine name (from SSMS)
      userName: 'DELL',          // Your Windows username
      password: ''               // Leave empty if no password
    }
  }
};

async function testConnection() {
  try {
    await sql.connect(config);
    console.log('✅ Connected successfully to SQL Server with Windows Authentication (NTLM).');
    const result = await sql.query('SELECT COUNT(*) AS count FROM TimeStats');
    console.log('📊 Row count:', result.recordset[0].count);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await sql.close();
  }
}

testConnection();