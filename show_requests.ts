import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);

  console.log("=== whatsapp_connection_requests ===");
  const [rows1] = await conn.execute("SELECT id, merchantId, fullNumber, status FROM whatsapp_connection_requests");
  console.log(JSON.stringify(rows1, null, 2));

  console.log("\n=== whatsapp_requests ===");
  const [rows2] = await conn.execute("SELECT id, merchant_id, phone_number, business_name, status FROM whatsapp_requests");
  console.log(JSON.stringify(rows2, null, 2));

  await conn.end();
}

main();
