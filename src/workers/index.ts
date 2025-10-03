/**
 * ChefPax Job Queue Workers
 * Start all background workers for production, delivery, and automation
 */

import './production-worker';
import './delivery-worker';
import './notification-worker';
import './automation-worker';

console.log('🚀 ChefPax job queue workers started');
console.log('📋 Available workers:');
console.log('  - Production tasks (SEED → GERMINATE → LIGHT → HARVEST → PACK)');
console.log('  - Delivery jobs (courier requests, status updates, notifications)');
console.log('  - Notifications (email, SMS, push notifications)');
console.log('  - Automation (subscription cycles, inventory checks, reminders)');
console.log('');
console.log('⏰ Workers are running in the background...');
console.log('🛑 Press Ctrl+C to stop all workers');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down workers...');
  const { closeQueues } = await import('@/lib/job-queue');
  await closeQueues();
  console.log('✅ All workers stopped');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down workers...');
  const { closeQueues } = await import('@/lib/job-queue');
  await closeQueues();
  console.log('✅ All workers stopped');
  process.exit(0);
});
