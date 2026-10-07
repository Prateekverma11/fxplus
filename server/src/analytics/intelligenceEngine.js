import prisma from '../utils/prisma.js';

/**
 * FX Intelligence & Quantitative Analytics Engine
 */
export class IntelligenceEngine {
  /**
   * Calculate standard deviation of an array of numbers
   */
  static calculateStdDev(values) {
    if (!values || values.length < 2) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  /**
   * Calculate Simple Moving Average (SMA)
   */
  static calculateSMA(values, windowSize) {
    if (!values || values.length < windowSize) return null;
    const slice = values.slice(-windowSize);
    return slice.reduce((a, b) => a + b, 0) / windowSize;
  }

  /**
   * Calculate comprehensive analytics for a specific currency pair
   */
  static async getPairAnalytics(base, quote) {
    const baseCode = (base || 'USD').toUpperCase();
    const quoteCode = (quote || 'INR').toUpperCase();

    // Fetch all historical records ordered chronologically
    let records = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: baseCode,
        quoteCurrency: quoteCode
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    if ((!records || records.length === 0) && baseCode !== quoteCode) {
      // Triangulate historical series via USD
      const [quoteSeries, baseSeries] = await Promise.all([
        prisma.exchangeRate.findMany({
          where: { baseCurrency: 'USD', quoteCurrency: quoteCode },
          orderBy: { timestamp: 'asc' }
        }),
        baseCode === 'USD'
          ? []
          : prisma.exchangeRate.findMany({
              where: { baseCurrency: 'USD', quoteCurrency: baseCode },
              orderBy: { timestamp: 'asc' }
            })
      ]);

      if (quoteSeries.length > 0) {
        if (baseCode === 'USD') {
          records = quoteSeries;
        } else if (baseSeries.length > 0) {
          const baseMap = new Map();
          for (const b of baseSeries) {
            const dayKey = b.timestamp.toISOString().split('T')[0];
            baseMap.set(dayKey, b.rate);
          }

          records = quoteSeries.map(q => {
            const dayKey = q.timestamp.toISOString().split('T')[0];
            const bRate = baseMap.get(dayKey) || baseSeries[baseSeries.length - 1].rate;
            const rate = bRate > 0 ? Number((q.rate / bRate).toFixed(4)) : q.rate;
            return {
              rate,
              timestamp: q.timestamp,
              source: q.source,
              baseCurrency: baseCode,
              quoteCurrency: quoteCode
            };
          });
        }
      }
    }

    if (!records || records.length === 0) {
      return null;
    }

    const rates = records.map(r => r.rate);
    const latestRecord = records[records.length - 1];
    const currentRate = latestRecord.rate;
    const latestTimestamp = latestRecord.timestamp;
    const source = latestRecord.source;

    // Helper to find closest historical rate N days ago
    const findRateNDaysAgo = (days) => {
      const targetTime = new Date(latestTimestamp.getTime() - days * 24 * 60 * 60 * 1000);
      for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].timestamp <= targetTime) {
          return records[i].rate;
        }
      }
      return records[0].rate;
    };

    const rate1d = findRateNDaysAgo(1);
    const rate7d = findRateNDaysAgo(7);
    const rate30d = findRateNDaysAgo(30);
    const rate90d = findRateNDaysAgo(90);
    const rate1y = findRateNDaysAgo(365);

    const calcPct = (curr, prev) => {
      if (!prev || prev === 0) return 0;
      return Number((((curr - prev) / prev) * 100).toFixed(4));
    };

    const change24h = calcPct(currentRate, rate1d);
    const change7d = calcPct(currentRate, rate7d);
    const change30d = calcPct(currentRate, rate30d);
    const change90d = calcPct(currentRate, rate90d);
    const change1y = calcPct(currentRate, rate1y);

    // Compute daily returns for volatility and standard deviation
    const dailyReturns = [];
    for (let i = 1; i < rates.length; i++) {
      const prev = rates[i - 1];
      if (prev > 0) {
        dailyReturns.push(((rates[i] - prev) / prev) * 100);
      }
    }

    const highestRate = Math.max(...rates);
    const lowestRate = Math.min(...rates);
    const averageRate = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4));
    const stdDev = Number(this.calculateStdDev(rates).toFixed(4));
    
    // Return volatility (std dev of percentage daily returns)
    const returnVolatility = dailyReturns.length > 1 ? Number(this.calculateStdDev(dailyReturns).toFixed(4)) : 0;
    
    // Volatility rating
    let volatilityCategory = 'Low';
    if (returnVolatility > 1.2) volatilityCategory = 'High';
    else if (returnVolatility > 0.6) volatilityCategory = 'Medium';

    // Moving average trend detection
    const smaShort = this.calculateSMA(rates, Math.min(7, rates.length)) || currentRate;
    const smaLong = this.calculateSMA(rates, Math.min(30, rates.length)) || averageRate;

    const smaDiffPct = ((smaShort - smaLong) / smaLong) * 100;
    let trend = 'Stable';
    let trendRationale = 'Short-term and long-term moving averages are balanced within ±0.2%.';

    if (smaDiffPct > 0.2) {
      trend = 'Rising';
      trendRationale = `Short-term 7D moving average (${smaShort.toFixed(4)}) is ${smaDiffPct.toFixed(2)}% above 30D baseline (${smaLong.toFixed(4)}).`;
    } else if (smaDiffPct < -0.2) {
      trend = 'Falling';
      trendRationale = `Short-term 7D moving average (${smaShort.toFixed(4)}) is ${Math.abs(smaDiffPct).toFixed(2)}% below 30D baseline (${smaLong.toFixed(4)}).`;
    }

    // Unusual movement detection (Z-score of latest 24h change vs daily return standard deviation)
    const meanDailyReturn = dailyReturns.length > 0 
      ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length 
      : 0;
    const zScore = returnVolatility > 0 ? Number((Math.abs(change24h - meanDailyReturn) / returnVolatility).toFixed(2)) : 0;
    const isUnusual = zScore >= 2.0;

    const totalPeriodChange = calcPct(currentRate, rates[0]);

    return {
      pair: `${baseCode}/${quoteCode}`,
      baseCurrency: baseCode,
      quoteCurrency: quoteCode,
      currentRate,
      previousRate: rate1d,
      timestamp: latestTimestamp,
      source,
      changes: {
        '24H': change24h,
        '7D': change7d,
        '30D': change30d,
        '90D': change90d,
        '1Y': change1y
      },
      stats: {
        highestRate,
        lowestRate,
        averageRate,
        stdDev,
        volatility: returnVolatility,
        volatilityCategory,
        totalPercentageChange: totalPeriodChange,
        observationsCount: records.length
      },
      technical: {
        sma7: Number(smaShort.toFixed(4)),
        sma30: Number(smaLong.toFixed(4)),
        smaDifferencePct: Number(smaDiffPct.toFixed(4)),
        trend,
        trendRationale,
        zScore,
        isUnusual,
        unusualMovementRule: 'Triggered when absolute 24H return exceeds 2.0 standard deviations from the rolling daily return mean.'
      }
    };
  }

  /**
   * Calculate top market movers (gainers, losers, volatile)
   */
  static async getTopMovers(base = 'USD', quoteList = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED']) {
    const list = [];

    for (const quote of quoteList) {
      if (base === quote) continue;
      const analytics = await this.getPairAnalytics(base, quote);
      if (analytics) {
        list.push({
          pair: `${base}/${quote}`,
          base,
          quote,
          rate: analytics.currentRate,
          change24h: analytics.changes['24H'],
          change7d: analytics.changes['7D'],
          change30d: analytics.changes['30D'],
          volatility: analytics.stats.volatility,
          volatilityCategory: analytics.stats.volatilityCategory,
          trend: analytics.technical.trend,
          timestamp: analytics.timestamp,
          source: analytics.source
        });
      }
    }

    // Sort by 24h change
    const gainers = [...list].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
    const losers = [...list].sort((a, b) => a.change24h - b.change24h).slice(0, 5);
    const mostVolatile = [...list].sort((a, b) => b.volatility - a.volatility).slice(0, 5);

    return {
      gainers,
      losers,
      mostVolatile,
      allTracked: list
    };
  }

  /**
   * Generate comprehensive market intelligence with analytical fact-based statements
   */
  static async getMarketIntelligence(base = 'USD') {
    const quoteList = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED'];
    const pairAnalyticsList = [];

    for (const quote of quoteList) {
      const analytics = await this.getPairAnalytics(base, quote);
      if (analytics) {
        pairAnalyticsList.push(analytics);
      }
    }

    if (pairAnalyticsList.length === 0) {
      return {
        summary: 'No sufficient market data records yet to compute market intelligence.',
        strongest: [],
        weakest: [],
        highestVolatility: [],
        unusualMovements: []
      };
    }

    // Strongest (by 7D performance)
    const strongest = [...pairAnalyticsList]
      .sort((a, b) => b.changes['7D'] - a.changes['7D'])
      .slice(0, 4)
      .map(p => ({
        pair: p.pair,
        change7d: p.changes['7D'],
        currentRate: p.currentRate,
        trend: p.technical.trend
      }));

    // Weakest (by 7D performance)
    const weakest = [...pairAnalyticsList]
      .sort((a, b) => a.changes['7D'] - b.changes['7D'])
      .slice(0, 4)
      .map(p => ({
        pair: p.pair,
        change7d: p.changes['7D'],
        currentRate: p.currentRate,
        trend: p.technical.trend
      }));

    // Highest volatility
    const highestVolatility = [...pairAnalyticsList]
      .sort((a, b) => b.stats.volatility - a.stats.volatility)
      .slice(0, 4)
      .map(p => ({
        pair: p.pair,
        volatility: p.stats.volatility,
        category: p.stats.volatilityCategory,
        stdDev: p.stats.stdDev
      }));

    // Unusual movements
    const unusualMovements = pairAnalyticsList
      .filter(p => p.technical.isUnusual || p.technical.zScore > 1.6)
      .map(p => ({
        pair: p.pair,
        change24h: p.changes['24H'],
        zScore: p.technical.zScore,
        volatility: p.stats.volatility,
        rule: p.technical.unusualMovementRule
      }));

    // Generate analytical statements strictly from calculated data
    const topPerformer = strongest[0];
    const worstPerformer = weakest[0];
    const topVolatile = highestVolatility[0];

    const statements = [];

    if (topPerformer && topPerformer.change7d !== 0) {
      const direction = topPerformer.change7d > 0 ? 'largest positive movement' : 'least negative movement';
      statements.push(`${topPerformer.pair} recorded the ${direction} (${topPerformer.change7d > 0 ? '+' : ''}${topPerformer.change7d}%) among tracked currencies over the 7-day period.`);
    }

    if (worstPerformer && worstPerformer.pair !== topPerformer?.pair) {
      statements.push(`${worstPerformer.pair} experienced the sharpest pullback (${worstPerformer.change7d}%) over the rolling 7-day horizon.`);
    }

    if (topVolatile && topVolatile.volatility > 0) {
      statements.push(`${topVolatile.pair} exhibited the highest return dispersion with an annualized daily volatility metric of ${topVolatile.volatility}%.`);
    }

    if (unusualMovements.length > 0) {
      statements.push(`Statistical anomaly alert: ${unusualMovements.map(u => u.pair).join(', ')} showed standard deviation Z-scores exceeding normal threshold.`);
    } else {
      statements.push('All tracked currency pairs are trading within their normal 2.0-sigma historical volatility distribution.');
    }

    const summary = statements.join(' ');

    return {
      marketBase: base,
      summary,
      statements,
      strongest,
      weakest,
      highestVolatility,
      unusualMovements,
      totalTrackedPairs: pairAnalyticsList.length,
      calculatedAt: new Date()
    };
  }
}

export default IntelligenceEngine;
