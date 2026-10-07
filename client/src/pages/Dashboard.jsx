import React, { useState, useEffect } from 'react';
import InrStatusCard from '../components/InrStatusCard';
import CurrencyDetailCard from '../components/CurrencyDetailCard';
import QuickCurrencies from '../components/QuickCurrencies';
import Footer from '../components/Footer';
import { 
  fetchCurrencies, 
  fetchPairAnalytics, 
  fetchPairHistory, 
  fetchPairRate 
} from '../services/api';

export default function Dashboard({
  selectedCurrency = 'USD',
  onSelectCurrency,
  currencies = [],
  systemStats,
  bookmarks = [],
  onToggleBookmark,
  isBookmarked
}) {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [ratesMap, setRatesMap] = useState({});

  const activeCurrencyObj = currencies.find(c => c.code === selectedCurrency) || {
    code: selectedCurrency,
    name: selectedCurrency === 'USD' ? 'US Dollar' : selectedCurrency,
    symbol: selectedCurrency === 'USD' ? '$' : selectedCurrency
  };

  // 1. Fetch Selected Currency Analytics and Historical Chart Data
  useEffect(() => {
    let isMounted = true;

    async function loadPairData() {
      try {
        setLoading(true);

        const [analyticsRes, historyRes] = await Promise.all([
          fetchPairAnalytics(selectedCurrency, 'INR').catch(() => ({ data: null })),
          fetchPairHistory(selectedCurrency, 'INR', timeframe).catch(() => ({ history: [] }))
        ]);

        if (isMounted) {
          setAnalytics(analyticsRes.data);
          setChartData(historyRes.history || []);
        }
      } catch (err) {
        console.warn('Pair data load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPairData();

    return () => {
      isMounted = false;
    };
  }, [selectedCurrency, timeframe]);

  // 2. Fetch quick rates for top popular currencies vs INR
  useEffect(() => {
    let isMounted = true;
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'AUD', 'CAD', 'SGD', 'CHF'];

    async function loadPopularRates() {
      try {
        const promises = popular.map(async (code) => {
          try {
            const res = await fetchPairRate(code, 'INR');
            return { code, rate: res.rate };
          } catch (e) {
            return { code, rate: null };
          }
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          const map = {};
          results.forEach(r => {
            if (r.rate) map[r.code] = r;
          });
          setRatesMap(map);
        }
      } catch (e) {
        console.warn('Popular rates error:', e);
      }
    }

    loadPopularRates();

    return () => {
      isMounted = false;
    };
  }, [systemStats?.lastSync]);

  const currentRate = analytics?.currentRate || (chartData.length > 0 ? chartData[chartData.length - 1].rate : null);
  const change24h = analytics?.changes?.['24H'] ?? 0;

  return (
    <div className="space-y-8">
      {/* 1. Indian Rupee Main Overview Status */}
      <InrStatusCard
        currentRate={currentRate}
        change24h={change24h}
        referenceCurrency={selectedCurrency}
        referenceSymbol={activeCurrencyObj.symbol}
      />

      {/* 2. Selected Currency Focus & Historical Graph with Bookmark Button */}
      <CurrencyDetailCard
        currency={activeCurrencyObj}
        analytics={analytics}
        chartData={chartData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        loading={loading}
        isBookmarked={isBookmarked ? isBookmarked(selectedCurrency) : bookmarks.includes(selectedCurrency)}
        onToggleBookmark={onToggleBookmark}
      />

      {/* 3. Quick Selector for Top Global Currencies */}
      <QuickCurrencies
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={onSelectCurrency}
        ratesMap={ratesMap}
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
      />

      {/* 4. Footer Metadata */}
      <Footer
        lastUpdated={analytics?.timestamp || systemStats?.lastSync}
        source={analytics?.source || systemStats?.provider || 'European Central Bank / FX Providers'}
      />
    </div>
  );
}

