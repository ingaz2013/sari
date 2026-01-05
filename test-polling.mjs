/**
 * Test script to check polling status and manually trigger a poll
 */
import { getPollingStatus, startPolling } from './server/polling.ts';
import { getWhatsAppConnectionRequestByMerchantId } from './server/db.ts';

const merchantId = 150001;

console.log('=== Testing Polling System ===\n');

// Check current polling status
const status = getPollingStatus();
console.log('Current active pollers:', status);

if (status.length === 0) {
  console.log('\n⚠️ No active pollers found!');
  console.log('Attempting to start polling for merchant', merchantId);
  
  try {
    const result = await startPolling(merchantId);
    console.log('Start polling result:', result);
    
    if (result.success) {
      console.log('✅ Polling started successfully');
      
      // Check status again
      const newStatus = getPollingStatus();
      console.log('New polling status:', newStatus);
    } else {
      console.log('❌ Failed to start polling:', result.error);
      
      // Check connection status
      const connection = await getWhatsAppConnectionRequestByMerchantId(merchantId);
      console.log('\nConnection details:');
      console.log('- Status:', connection?.status);
      console.log('- Instance ID:', connection?.instanceId ? 'Present' : 'Missing');
      console.log('- API Token:', connection?.apiToken ? 'Present' : 'Missing');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
} else {
  console.log('✅ Polling is active for', status.length, 'merchant(s)');
}

console.log('\n=== Test Complete ===');
process.exit(0);
