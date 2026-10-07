import prisma from '../utils/prisma.js';
import fxService from '../services/fxService.js';

export const getCurrencies = async (req, res) => {
  try {
    let currencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' }
    });

    if (!currencies || currencies.length === 0) {
      // Fallback standard currencies
      const standard = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
      ];
      return res.json({ success: true, count: standard.length, data: standard });
    }

    res.json({ success: true, count: currencies.length, data: currencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLatestRates = async (req, res) => {
  const base = (req.query.base || 'USD').toUpperCase();
  try {
    // Get latest rates from database
    const latestRates = await prisma.exchangeRate.findMany({
      where: { baseCurrency: base },
      orderBy: { timestamp: 'desc' }
    });

    // Deduplicate to get the latest per quoteCurrency
    const quoteMap = new Map();
    for (const r of latestRates) {
      if (!quoteMap.has(r.quoteCurrency)) {
        quoteMap.set(r.quoteCurrency, r);
      }
    }

    const rates = Array.from(quoteMap.values());

    if (rates.length === 0) {
      // If DB is empty, trigger a live fetch
      const liveData = await fxService.fetchLatestRates(base);
      return res.json({
        success: true,
        base,
        marketTimestamp: liveData.marketTimestamp,
        source: liveData.provider,
        isLive: true,
        count: liveData.rates.length,
        rates: liveData.rates
      });
    }

    const marketTimestamp = rates[0]?.timestamp || new Date();
    const source = rates[0]?.source || 'External FX Provider';

    res.json({
      success: true,
      base,
      marketTimestamp,
      source,
      count: rates.length,
      rates: rates.map(r => ({
        base: r.baseCurrency,
        quote: r.quoteCurrency,
        rate: r.rate,
        timestamp: r.timestamp,
        source: r.source
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Currency provider temporarily unavailable. Showing latest stored data.', 
      error: error.message 
    });
  }
};

export const getPairRate = async (req, res) => {
  const base = (req.params.base || 'USD').toUpperCase();
  const quote = (req.params.quote || 'INR').toUpperCase();

  try {
    let rateRecord = await prisma.exchangeRate.findFirst({
      where: {
        baseCurrency: base,
        quoteCurrency: quote
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!rateRecord && base !== quote) {
      // Triangulate via USD if available
      const [usdToQuote, usdToBase] = await Promise.all([
        prisma.exchangeRate.findFirst({
          where: { baseCurrency: 'USD', quoteCurrency: quote },
          orderBy: { timestamp: 'desc' }
        }),
        base === 'USD' ? { rate: 1.0, timestamp: new Date(), source: 'Reference' } : prisma.exchangeRate.findFirst({
          where: { baseCurrency: 'USD', quoteCurrency: base },
          orderBy: { timestamp: 'desc' }
        })
      ]);

      if (usdToQuote && usdToBase && usdToBase.rate > 0) {
        const derivedRate = Number((usdToQuote.rate / usdToBase.rate).toFixed(4));
        rateRecord = {
          baseCurrency: base,
          quoteCurrency: quote,
          rate: derivedRate,
          timestamp: usdToQuote.timestamp || new Date(),
          source: usdToQuote.source || 'FXPulse Derived'
        };
      }
    }

    if (!rateRecord) {
      return res.status(404).json({
        success: false,
        message: `No stored rate found for pair ${base}/${quote}`
      });
    }

    res.json({
      success: true,
      pair: `${base}/${quote}`,
      base: rateRecord.baseCurrency,
      quote: rateRecord.quoteCurrency,
      rate: rateRecord.rate,
      timestamp: rateRecord.timestamp,
      source: rateRecord.source
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPairHistory = async (req, res) => {
  const base = (req.params.base || 'USD').toUpperCase();
  const quote = (req.params.quote || 'INR').toUpperCase();
  const timeframe = (req.query.timeframe || '30D').toUpperCase();

  let days = 30;
  if (timeframe === '1D') days = 1;
  else if (timeframe === '7D') days = 7;
  else if (timeframe === '30D') days = 30;
  else if (timeframe === '90D') days = 90;
  else if (timeframe === '1Y') days = 365;
  else if (timeframe === 'ALL') days = 730;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    let records = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: base,
        quoteCurrency: quote,
        timestamp: { gte: cutoffDate }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (records.length === 0 && base !== quote) {
      // Triangulate historical series via USD
      const [quoteSeries, baseSeries] = await Promise.all([
        prisma.exchangeRate.findMany({
          where: { baseCurrency: 'USD', quoteCurrency: quote, timestamp: { gte: cutoffDate } },
          orderBy: { timestamp: 'asc' }
        }),
        base === 'USD'
          ? []
          : prisma.exchangeRate.findMany({
              where: { baseCurrency: 'USD', quoteCurrency: base, timestamp: { gte: cutoffDate } },
              orderBy: { timestamp: 'asc' }
            })
      ]);

      if (quoteSeries.length > 0) {
        if (base === 'USD') {
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
              baseCurrency: base,
              quoteCurrency: quote
            };
          });
        }
      }
    }

    res.json({
      success: true,
      pair: `${base}/${quote}`,
      base,
      quote,
      timeframe,
      count: records.length,
      history: records.map(r => ({
        rate: r.rate,
        timestamp: r.timestamp,
        formattedDate: new Date(r.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: timeframe === '1Y' || timeframe === 'ALL' ? 'numeric' : undefined
        }),
        source: r.source
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
