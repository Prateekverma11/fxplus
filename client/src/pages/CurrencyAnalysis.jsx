import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import HistoricalChart from '../charts/HistoricalChart';
import { fetchPairAnalytics, fetchPairHistory } from '../services/api';
import { ChartSkeleton } from '../components/LoadingSkeleton';

export default function CurrencyAnalysis() {
  const { base = 'USD', quote = 'INR' } = useParams();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState('30D');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  const supportedBases = ['USD', 'EUR', 'GBP'];
  const supportedQuotes = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED'];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, historyRes] = await Promise.all([
        fetchPairAnalytics(base, quote),
        fetchPairHistory(base, quote, timeframe)
      ]);

      setAnalytics(analyticsRes.data);
      setHistoryData(historyRes.history || []);
    } catch (err) {
      console.error('Failed to load pair analysis:', err);
      setError(`Unable to load analysis for ${base}/${quote}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [base, quote, timeframe]);

  const handlePairChange = (newBase, newQuote) => {
    navigate(`/analysis/${newBase}/${newQuote}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation & Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/markets"
            className="w-8 h-8 rounded-lg bg-[#0d0d0d] hover:bg-[#161616] border border-[#222222] flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-medium text-white tracking-normal">
                {base} &rarr; {quote}
              </h2>
              {analytics && (
                <span className="text-xs text-zinc-500 font-normal">
                  ({analytics.technical.trend} Trend)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              Statistical analytics and moving average trend signals.
            </p>
          </div>
        </div>

        {/* Dynamic Pair Selector Dropdowns */}
        <div className="flex items-center gap-2 bg-[#0d0d0d] p-1.5 rounded-lg border border-[#222222] text-xs font-normal">
          <span className="text-zinc-500 pl-2">Select Pair:</span>
          <select
            value={base}
            onChange={(e) => handlePairChange(e.target.value, quote)}
            className="bg-[#141414] text-white px-2.5 py-1.5 rounded-md border border-[#262626] focus:outline-none"
          >
            {supportedBases.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <span className="text-zinc-600">/</span>
          <select
            value={quote}
            onChange={(e) => handlePairChange(base, e.target.value)}
            className="bg-[#141414] text-white px-2.5 py-1.5 rounded-md border border-[#262626] focus:outline-none"
          >
            {supportedQuotes.filter(q => q !== base).map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-8 rounded-xl card-clean text-center space-y-3">
          <p className="text-xs text-zinc-300 font-normal">{error}</p>
          <button
            onClick={() => handlePairChange('USD', 'INR')}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-colors"
          >
            Reset to USD/INR
          </button>
        </div>
      ) : (
        <>
          {/* Rate & Multi-Period Performance Header Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Current Spot Rate */}
            <div className="col-span-2 sm:col-span-1 card-clean p-4">
              <span className="text-xs text-zinc-500 font-normal block">Spot Rate</span>
              <div className="mt-1.5">
                <span className="text-xl font-normal text-white">
                  {analytics ? (analytics.currentRate > 10 ? analytics.currentRate.toFixed(2) : analytics.currentRate.toFixed(4)) : '--'}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5 font-normal">{quote}</span>
              </div>
              <span className="text-[11px] text-zinc-600 mt-1.5 block font-normal">
                {analytics?.source || 'FX Provider'}
              </span>
            </div>

            {/* Performance Horizons */}
            {['24H', '7D', '30D', '90D', '1Y'].map((period) => {
              const val = analytics?.changes?.[period] || 0;
              const isPos = val > 0;
              const isZero = val === 0;
              return (
                <div key={period} className="card-clean p-4">
                  <span className="text-xs text-zinc-500 font-normal block">{period} Change</span>
                  <div className="mt-1.5 text-base font-normal">
                    <span className={isPos ? 'text-emerald-400' : isZero ? 'text-zinc-500' : 'text-rose-400'}>
                      {isPos ? `+${val}%` : `${val}%`}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-600 mt-1.5 block font-normal">
                    {isPos ? 'Appreciation' : isZero ? 'Unchanged' : 'Depreciation'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Historical Chart */}
          <div className="card-clean p-6">
            {loading && historyData.length === 0 ? (
              <ChartSkeleton />
            ) : (
              <HistoricalChart
                data={historyData}
                pair={`${base}/${quote}`}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            )}
          </div>

          {/* Statistics Grid & Trend Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Statistical Metrics */}
            <div className="card-clean p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
                <h3 className="text-xs font-medium text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-300" />
                  Statistical Metrics
                </h3>
                <span className="text-xs text-zinc-500 font-normal">
                  {analytics?.stats.observationsCount || 0} observations
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-normal">
                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Highest Rate</span>
                  <span className="text-white text-sm font-normal mt-0.5 block">{analytics?.stats.highestRate?.toFixed(4) || '--'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Lowest Rate</span>
                  <span className="text-white text-sm font-normal mt-0.5 block">{analytics?.stats.lowestRate?.toFixed(4) || '--'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Average Rate</span>
                  <span className="text-white text-sm font-normal mt-0.5 block">{analytics?.stats.averageRate?.toFixed(4) || '--'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Standard Deviation (σ)</span>
                  <span className="text-white text-sm font-normal mt-0.5 block">{analytics?.stats.stdDev?.toFixed(4) || '--'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Return Volatility</span>
                  <span className="text-amber-400 text-sm font-normal mt-0.5 block">
                    {analytics?.stats.volatility || 0}% ({analytics?.stats.volatilityCategory})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                  <span className="text-zinc-500 block text-[11px]">Total Horizon Change</span>
                  <span className={`text-sm font-normal mt-0.5 block ${(analytics?.stats.totalPercentageChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(analytics?.stats.totalPercentageChange || 0) >= 0 ? `+${analytics?.stats.totalPercentageChange}%` : `${analytics?.stats.totalPercentageChange}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Moving Average & Anomaly Rationale */}
            <div className="card-clean p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
                <h3 className="text-xs font-medium text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-zinc-300" />
                  Trend &amp; Moving Average Signals
                </h3>
              </div>

              {/* Moving Average Card */}
              <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] space-y-1.5 text-xs font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Moving Average Comparison</span>
                  <span className="text-zinc-300">
                    SMA 7: {analytics?.technical.sma7?.toFixed(4)} &bull; SMA 30: {analytics?.technical.sma30?.toFixed(4)}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {analytics?.technical.trendRationale}
                </p>
              </div>

              {/* Anomaly Detection Status */}
              <div className="p-3.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] space-y-1.5 text-xs font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Deviation Status</span>
                  <span className="text-zinc-300">
                    Z-Score: {analytics?.technical.zScore}σ
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {analytics?.technical.isUnusual 
                    ? 'Latest 24H return exceeds 2.0 standard deviations from historical daily return mean.' 
                    : 'Fluctuating within the standard 2.0 standard deviation variance corridor.'}
                </p>
              </div>

              <div className="pt-1">
                <Link
                  to={`/comparison?base=${base}&quotes=${quote},EUR,GBP,JPY`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0d0d0d] hover:bg-[#161616] text-zinc-300 hover:text-white transition-colors text-xs font-normal border border-[#222222]"
                >
                  <span>Compare with peer currencies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
