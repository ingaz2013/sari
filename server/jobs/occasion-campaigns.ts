/**
 * Occasion Campaigns Cron Job
 * 
 * Runs daily at 9:00 AM to check for special occasions
 * and send promotional campaigns automatically.
 */

import { checkAndSendOccasionCampaigns } from '../automation/occasion-campaigns';

/**
 * Main cron job function
 * Should be scheduled to run daily at 9:00 AM
 */
export async function runOccasionCampaignsCron() {
  console.log('[Cron] Starting occasion campaigns check...');
  
  try {
    await checkAndSendOccasionCampaigns();
    console.log('[Cron] Occasion campaigns check completed successfully');
  } catch (error) {
    console.error('[Cron] Error in occasion campaigns check:', error);
  }
}
