import IntelligenceEngine from '../analytics/intelligenceEngine.js';
import prisma from '../utils/prisma.js';

export const getPairAnalytics = async (req, res) => {
  const base = (req.params.base || 'USD').toUpperCase();
  const quote = (req.params.quote || 'INR').toUpperCase();

  try {
    const analytics = await IntelligenceEngine.getPairAnalytics(base, quote);
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: `Analytics data not available for pair ${base}/${quote}`
      });
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopMovers = async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase();
  try {
    const movers = await IntelligenceEngine.getTopMovers(base);
    res.json({
      success: true,
      base,
      data: movers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMarketIntelligence = async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase();
  try {
    const intelligence = await IntelligenceEngine.getMarketIntelligence(base);
    res.json({
      success: true,
      data: intelligence
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const comparePairs = async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase();
  const quotesParam = req.query.quotes || 'INR,EUR,GBP,JPY';
  const timeframe = (req.query.timeframe || '30D').toUpperCase();

  const quotes = quotesParam.split(',').map(q => q.trim().toUpperCase()).filter(Boolean);

  let days = 30;
  if (timeframe === '1D') days = 1;
  else if (timeframe === '7D') days = 7;
  else if (timeframe === '30D') days = 30;
  else if (timeframe === '90D') days = 90;
  else if (timeframe === '1Y') days = 365;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  try {
    const allSeries = {};
    const dateMap = new Map();

    for (const quote of quotes) {
      const records = await prisma.exchangeRate.findMany({
        where: {
          baseCurrency: base,
          quoteCurrency: quote,
          timestamp: { gte: cutoff }
        },
        orderBy: { timestamp: 'asc' }
      });

      if (records.length > 0) {
        const baseRate = records[0].rate;
        for (const r of records) {
          const dateKey = r.timestamp.toISOString().split('T')[0];
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
              date: dateKey,
              formattedDate: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          }
          const entry = dateMap.get(dateKey);
          entry[`${base}_${quote}`] = r.rate;
          // Percentage return relative to start of period for normalized visual comparison
          const pctChange = Number((((r.rate - baseRate) / baseRate) * 100).toFixed(2));
          entry[`${base}_${quote}_pct`] = pctChange;
        }
      }
    }

    const mergedData = Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      base,
      quotes,
      timeframe,
      data: mergedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
