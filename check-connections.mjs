import { db } from './drizzle/db.js';
import { whatsappConnectionRequests } from './drizzle/schema.ts';

const connections = await db.select().from(whatsappConnectionRequests);
console.log('WhatsApp Connections:', JSON.stringify(connections, null, 2));
