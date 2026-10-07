import fxService from '../services/fxService.js';
import prisma from '../utils/prisma.js';
import { evaluateAlerts } from '../jobs/cronJobs.js';

export const manualSync = async (req, res) => {
  try {
    const bases = req.body.bases || ['USD', 'EUR', 'GBP'];
    const result = await fxService.syncRatesToDatabase(bases);
    
    // Check if we should seed historical rates as well
    if (req.body.seedHistorical) {
      await fxService.seedHistoricalRates(req.body.days || 120);
    }

    // Evaluate alerts
    await evaluateAlerts();

    res.json({
      success: true,
      message: 'Currency data synchronized successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Synchronization failed',
      error: error.message
    });
  }
};

export const getSystemStatus = async (req, res) => {
  try {
    const [rateCount, alertCount, activeAlertCount, lastSync] = await Promise.all([
      prisma.exchangeRate.count(),
      prisma.alert.count(),
      prisma.alert.count({ where: { active: true } }),
      prisma.syncLog.findFirst({ orderBy: { createdAt: 'desc' } })
    ]);

    const activeProvider = fxService.getActiveProvider();

    res.json({
      success: true,
      status: 'HEALTHY',
      timestamp: new Date(),
      provider: {
        name: activeProvider.name,
        baseUrl: activeProvider.baseUrl,
        hasKey: Boolean(process.env.FX_API_KEY)
      },
      stats: {
        totalRateObservations: rateCount,
        totalAlerts: alertCount,
        activeAlerts: activeAlertCount,
        lastSync: lastSync ? {
          status: lastSync.status,
          timestamp: lastSync.createdAt,
          marketTimestamp: lastSync.marketTimestamp,
          recordsCount: lastSync.recordsCount,
          durationMs: lastSync.requestDurationMs,
          message: lastSync.message
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
