import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, merchantId, instanceId, apiToken, apiUrl, status FROM whatsapp_connection_requests WHERE merchantId = 150001');
console.log('Green API Settings:');
rows.forEach(r => {
  console.log(`Instance ID: ${r.instanceId}`);
  console.log(`API Token: ${r.apiToken}`);
  console.log(`API URL: ${r.apiUrl}`);
  console.log(`Status: ${r.status}`);
});
await conn.end();
