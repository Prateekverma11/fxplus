import cron from 'node-cron';
import fxService from '../services/fxService.js';
import prisma from '../utils/prisma.js';
import IntelligenceEngine from '../analytics/intelligenceEngine.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

/**
 * Evaluate active user alerts against latest rates
 */
export const evaluateAlerts = async () => {
  try {
    const activeAlerts = await prisma.alert.findMany({
      where: { active: true }
    });

    if (!activeAlerts || activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      const analytics = await IntelligenceEngine.getPairAnalytics(alert.baseCurrency, alert.quoteCurrency);
      if (!analytics) continue;

      const currentRate = analytics.currentRate;
      const change24h = analytics.changes['24H'];
      let isTriggered = false;
      let triggerReason = '';

      switch (alert.condition) {
        case 'ABOVE':
          if (currentRate >= alert.threshold) {
            isTriggered = true;
            triggerReason = `${alert.baseCurrency}/${alert.quoteCurrency} rate (${currentRate}) is above threshold (${alert.threshold})`;
          }
          break;
        case 'BELOW':
          if (currentRate <= alert.threshold) {
            isTriggered = true;
            triggerReason = `${alert.baseCurrency}/${alert.quoteCurrency} rate (${currentRate}) is below threshold (${alert.threshold})`;
          }
          break;
        case 'PCT_CHANGE_GT':
          if (Math.abs(change24h) >= alert.threshold) {
            isTriggered = true;
            triggerReason = `${alert.baseCurrency}/${alert.quoteCurrency} 24h change (${change24h}%) exceeded ${alert.threshold}%`;
          }
          break;
        case 'PCT_CHANGE_LT':
          if (Math.abs(change24h) <= alert.threshold) {
            isTriggered = true;
            triggerReason = `${alert.baseCurrency}/${alert.quoteCurrency} 24h change (${change24h}%) is within ${alert.threshold}%`;
          }
          break;
      }

      if (isTriggered) {
        const updatedAlert = await prisma.alert.update({
          where: { id: alert.id },
          data: {
            triggeredAt: new Date(),
            lastCheckedAt: new Date(),
            active: false
          }
        });

        // Broadcast alert event to connected WebSocket clients
        if (ioInstance) {
          ioInstance.emit('alert:triggered', {
            alert: updatedAlert,
            reason: triggerReason,
            timestamp: new Date(),
            currentRate,
            change24h
          });
        }
      } else {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastCheckedAt: new Date() }
        });
      }
    }
  } catch (error) {
    console.error('Error evaluating alerts:', error.message);
  }
};

/**
 * Initialize scheduled sync cron jobs
 */
export const initCronJobs = () => {
  const scheduleExpr = process.env.CRON_SCHEDULE || '*/15 * * * *';
  console.log(`[Cron] Initializing currency data sync with schedule: ${scheduleExpr}`);

  cron.schedule(scheduleExpr, async () => {
    console.log(`[Cron] Executing scheduled FX data sync at ${new Date().toISOString()}...`);
    try {
      const syncResult = await fxService.syncRatesToDatabase(['USD', 'EUR', 'GBP']);
      console.log(`[Cron] Sync completed successfully. Saved ${syncResult.recordsCount} records.`);

      // Broadcast new rate update to clients
      if (ioInstance) {
        ioInstance.emit('rates:updated', {
          timestamp: new Date(),
          marketTimestamp: syncResult.marketTimestamp,
          provider: syncResult.provider,
          recordsCount: syncResult.recordsCount
        });
      }

      // Check alerts
      await evaluateAlerts();
    } catch (err) {
      console.error('[Cron] Sync job encountered an error:', err.message);
    }
  });
};
