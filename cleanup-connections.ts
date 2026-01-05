import * as db from './server/db';

async function cleanupConnections() {
  console.log('Starting cleanup...');
  
  // Get all connections
  const connections = await db.getAllWhatsAppConnectionRequests();
  console.log(`Found ${connections.length} connections`);
  
  // Keep only the correct one (merchantId: 150001, id: 210001)
  const correctConnection = connections.find(c => c.id === 210001);
  if (!correctConnection) {
    console.error('Correct connection not found!');
    return;
  }
  
  console.log('Keeping connection:', correctConnection);
  
  // Delete all others
  for (const conn of connections) {
    if (conn.id !== 210001) {
      console.log(`Deleting connection ${conn.id}...`);
      await db.deleteWhatsAppConnectionRequest(conn.id);
    }
  }
  
  console.log('Cleanup completed!');
  
  // Verify
  const remaining = await db.getAllWhatsAppConnectionRequests();
  console.log(`Remaining connections: ${remaining.length}`);
  console.log(JSON.stringify(remaining, null, 2));
}

cleanupConnections().catch(console.error);
