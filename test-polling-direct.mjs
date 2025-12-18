import { startAllPolling } from './server/polling.ts';

console.log('Testing polling directly...');
await startAllPolling();
console.log('Polling started. Waiting for messages...');

// Keep script running
setInterval(() => {
  console.log('[Test] Still running...');
}, 10000);
