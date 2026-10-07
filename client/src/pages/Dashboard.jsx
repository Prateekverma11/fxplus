import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BrainCircuit, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import HistoricalChart from '../charts/HistoricalChart';
import { StatCardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { 
  fetchPairAnalytics, 
  fetchPairHistory, 
  fetchTopMovers, 
  fetchMarketIntelligence 
} from '../services/api';

export default function Dashboard({ baseCurrency = 'USD' }) {
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState({ base: baseCurrency, quote: 'INR' });
  const [timeframe, setTimeframe] = useState('30D');

  const [mainPairsData, setMainPairsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [movers, setMovers] = useState({ gainers: [], losers: [], mostVolatile: [] });
  const [intelligence, setIntelligence] = useState(null);

  const defaultQuotes = ['INR', 'EUR', 'GBP', 'JPY'];

  useEffect(() => {
    setSelectedPair(prev => ({ ...prev, base: baseCurrency }));
  }, [baseCurrency]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const pairPromises = defaultQuotes.map(q => 
        fetchPairAnalytics(baseCurrency, q).catch(() => null)
      );

      const historyPromise = fetchPairHistory(selectedPair.base, selectedPair.quote, timeframe).catch(() => ({ history: [] }));
      const moversPromise = fetchTopMovers(baseCurrency).catch(() => ({ data: { gainers: [], losers: [], mostVolatile: [] } }));
      const intelligencePromise = fetchMarketIntelligence(baseCurrency).catch(() => ({ data: null }));

      const [pairRes, historyRes, moversRes, intelRes] = await Promise.all([
        Promise.all(pairPromises),
        historyPromise,
        moversPromise,
        intelligencePromise
      ]);

      const validPairs = pairRes.filter(Boolean).map(r => r.data);
      setMainPairsData(validPairs);
      setChartData(historyRes.history || []);
      setMovers(moversRes.data || { gainers: [], losers: [], mostVolatile: [] });
      setIntelligence(intelRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [baseCurrency, selectedPair.quote, timeframe]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Benchmark Pair Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-300">
            Tracked Currencies ({baseCurrency} Base)
          </h2>
          <span className="text-xs text-zinc-500 font-normal">Updated periodically</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && mainPairsData.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : mainPairsData.length > 0 ? (
            mainPairsData.map((item) => (
              <StatCard
                key={item.pair}
                base={item.baseCurrency}
                quote={item.quoteCurrency}
                rate={item.currentRate}
                change24h={item.changes['24H']}
                previousRate={item.previousRate}
                timestamp={item.timestamp}
                trend={item.technical.trend}
              />
            ))
          ) : (
            <div className="col-span-4 p-8 text-center text-zinc-500 card-clean text-xs font-normal">
              No market pairs loaded. Please sync data via the top right button.
            </div>
          )}
        </div>
      </section>

      {/* 2. Market Overview Chart */}
      <section className="card-clean p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1a1a1a]">
          <div>
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-300" />
              Market Overview
            </h2>
            <p className="text-xs text-zinc-500 font-normal mt-0.5">
              Historical price movements calculated from stored reference records.
            </p>
          </div>

          {/* Quick Select Quote Currency */}
          <div className="flex items-center gap-2 text-xs font-normal">
            <span className="text-zinc-500">Currency Pair:</span>
            <select
              value={selectedPair.quote}
              onChange={(e) => setSelectedPair(p => ({ ...p, quote: e.target.value }))}
              className="bg-[#0d0d0d] text-zinc-200 text-xs px-3 py-1.5 rounded-lg border border-[#222222] focus:outline-none"
            >
              {['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED'].map(q => (
                <option key={q} value={q}>{baseCurrency}/{q}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && chartData.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <HistoricalChart
            data={chartData}
            pair={`${selectedPair.base}/${selectedPair.quote}`}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        )}
      </section>

      {/* 3. Top Movers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gainers */}
        <div className="card-clean p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a1a1a]">
              <h3 className="text-xs font-medium text-white flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Top Gainers (24H)
              </h3>
            </div>

            <div className="space-y-1.5">
              {movers.gainers && movers.gainers.length > 0 ? (
                movers.gainers.slice(0, 4).map((g) => (
                  <Link
                    key={g.pair}
                    to={`/analysis/${g.base}/${g.quote}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#121212] transition-colors"
                  >
                    <div>
                      <span className="text-xs font-normal text-zinc-200">{g.pair}</span>
                      <p className="text-[11px] text-zinc-500 font-normal">{g.rate > 10 ? g.rate.toFixed(2) : g.rate.toFixed(4)}</p>
                    </div>
                    <span className="text-xs font-normal text-emerald-400">
                      +{g.change24h}%
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center font-normal">No movers data available</p>
              )}
            </div>
          </div>

          <Link
            to="/markets"
            className="pt-3 border-t border-[#1a1a1a] text-xs font-normal text-zinc-400 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>View all markets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Losers */}
        <div className="card-clean p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a1a1a]">
              <h3 className="text-xs font-medium text-white flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                Top Losers (24H)
              </h3>
            </div>

            <div className="space-y-1.5">
              {movers.losers && movers.losers.length > 0 ? (
                movers.losers.slice(0, 4).map((l) => (
                  <Link
                    key={l.pair}
                    to={`/analysis/${l.base}/${l.quote}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#121212] transition-colors"
                  >
                    <div>
                      <span className="text-xs font-normal text-zinc-200">{l.pair}</span>
                      <p className="text-[11px] text-zinc-500 font-normal">{l.rate > 10 ? l.rate.toFixed(2) : l.rate.toFixed(4)}</p>
                    </div>
                    <span className="text-xs font-normal text-rose-400">
                      {l.change24h}%
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center font-normal">No losers recorded</p>
              )}
            </div>
          </div>

          <Link
            to="/markets"
            className="pt-3 border-t border-[#1a1a1a] text-xs font-normal text-zinc-400 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>View all markets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Volatile */}
        <div className="card-clean p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a1a1a]">
              <h3 className="text-xs font-medium text-white flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Most Volatile
              </h3>
            </div>

            <div className="space-y-1.5">
              {movers.mostVolatile && movers.mostVolatile.length > 0 ? (
                movers.mostVolatile.slice(0, 4).map((v) => (
                  <Link
                    key={v.pair}
                    to={`/analysis/${v.base}/${v.quote}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#121212] transition-colors"
                  >
                    <div>
                      <span className="text-xs font-normal text-zinc-200">{v.pair}</span>
                      <span className="text-[11px] text-zinc-500 block font-normal">{v.volatilityCategory} volatility</span>
                    </div>
                    <span className="text-xs font-normal text-amber-400">
                      {v.volatility}%
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center font-normal">No volatility calculated</p>
              )}
            </div>
          </div>

          <Link
            to="/intelligence"
            className="pt-3 border-t border-[#1a1a1a] text-xs font-normal text-zinc-400 hover:text-white flex items-center justify-between transition-colors"
          >
            <span>View intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Market Intelligence Section */}
      <section className="card-clean p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Market Intelligence</h3>
            <p className="text-xs text-zinc-500 font-normal">Calculated statistical signals</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-normal leading-relaxed pt-1">
          {intelligence?.summary || "Analyzing historical variance and moving averages to extract market trends across currency pairs."}
        </p>

        {intelligence?.statements && intelligence.statements.length > 1 && (
          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {intelligence.statements.slice(0, 4).map((stmt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400 p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{stmt}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
