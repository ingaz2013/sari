import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, merchantId, status FROM whatsapp_connection_requests ORDER BY id DESC LIMIT 10');
console.log('Results:');
rows.forEach(r => console.log(`ID: ${r.id}, MerchantID: ${r.merchantId}, Status: "${r.status}"`));
await conn.end();
