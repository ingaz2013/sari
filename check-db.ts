import * as db from './server/db';

async function checkConnections() {
  const connections = await db.getAllWhatsAppConnectionRequests();
  console.log('WhatsApp Connections:', JSON.stringify(connections, null, 2));
}

checkConnections().catch(console.error);
