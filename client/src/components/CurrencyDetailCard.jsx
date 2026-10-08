import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Bookmark, TrendingUp, BarChart2, Activity } from 'lucide-react';
import HistoricalChart from '../charts/HistoricalChart';
import { ChartSkeleton } from './LoadingSkeleton';

export default function CurrencyDetailCard({
  currency,
  analytics,
  chartData = [],
  timeframe = '30D',
  onTimeframeChange,
  loading = false,
  isBookmarked = false,
  onToggleBookmark
}) {
  const code = currency?.code || 'USD';
  const name = currency?.name || 'US Dollar';
  const symbol = currency?.symbol || '$';

  const rate = analytics?.currentRate || (chartData.length > 0 ? Number(chartData[chartData.length - 1].rate) : null);
  const change24h = analytics?.changes?.['24H'] ?? 0;
  const trend = analytics?.technical?.trend || 'Stable';

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  // Calculate stats from chart data
  const validRates = chartData.map(d => Number(d.rate)).filter(r => !isNaN(r) && r > 0);
  const periodHigh = validRates.length > 0 ? Math.max(...validRates) : rate;
  const periodLow = validRates.length > 0 ? Math.min(...validRates) : rate;
  const periodAvg = validRates.length > 0 ? (validRates.reduce((a, b) => a + b, 0) / validRates.length) : rate;
  
  let periodChange = 0;
  if (validRates.length >= 2) {
    const startRate = validRates[0];
    const endRate = validRates[validRates.length - 1];
    periodChange = Number((((endRate - startRate) / startRate) * 100).toFixed(2));
  }

  let trendBadgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200/90';
  if (trend === 'Rising' || trend === 'Strengthening') {
    trendBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (trend === 'Falling' || trend === 'Weakening') {
    trendBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  return (
    <div className="card-clean p-5 sm:p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-sm font-bold text-zinc-900 shadow-clean-xs">
            {symbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
                {code} <span className="text-zinc-400 font-normal">/</span> INR
              </span>
              <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                {code}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal">
              {name} vs Indian Rupee spot exchange
            </p>
          </div>
        </div>

        {/* Status & Bookmark Button */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${trendBadgeClass}`}>
            {trend === 'Rising' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
            {trend === 'Falling' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
            {trend === 'Stable' && <Minus className="w-3.5 h-3.5 text-zinc-500" />}
            {trend}
          </span>

          <button
            type="button"
            onClick={() => onToggleBookmark?.(code)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isBookmarked
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-clean-xs hover:bg-amber-100'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
            title={isBookmarked ? 'Remove from watchlist' : 'Bookmark this currency'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-transform ${
                isBookmarked ? 'fill-amber-500 text-amber-500 scale-105' : 'text-zinc-400'
              }`}
            />
            <span>{isBookmarked ? 'Watchlisted' : 'Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Rate and Change Display */}
      <div className="flex flex-wrap items-baseline gap-4">
        <div>
          <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight tabular-nums">
            ₹{rate ? (rate > 10 ? rate.toFixed(2) : rate.toFixed(4)) : '--'}
          </span>
          <span className="text-xs text-zinc-500 ml-2 font-normal">
            per 1 {code}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-sm sm:text-base font-semibold tabular-nums px-2 py-0.5 rounded-lg ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : isNegative ? 'bg-rose-50 text-rose-700' : 'bg-zinc-100 text-zinc-700'
          }`}>
            {isPositive ? `+${change24h}%` : `${change24h}%`}
          </span>
          <span className="text-xs text-zinc-400 font-normal">24h change</span>
        </div>
      </div>

      {/* Historical Graph */}
      <div className="pt-2">
        {loading && chartData.length === 0 ? (
          <ChartSkeleton />
        ) : (
          <HistoricalChart
            data={chartData}
            pair={`${code} → INR`}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            isPositive={isPositive}
          />
        )}
      </div>

      {/* Key Period Metrics 4-Box Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100">
        <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
          <span className="text-[11px] text-zinc-400 block font-normal mb-0.5">
            {timeframe} High
          </span>
          <span className="text-sm font-bold text-zinc-900 tabular-nums">
            ₹{periodHigh ? (periodHigh > 10 ? periodHigh.toFixed(2) : periodHigh.toFixed(4)) : '--'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
          <span className="text-[11px] text-zinc-400 block font-normal mb-0.5">
            {timeframe} Low
          </span>
          <span className="text-sm font-bold text-zinc-900 tabular-nums">
            ₹{periodLow ? (periodLow > 10 ? periodLow.toFixed(2) : periodLow.toFixed(4)) : '--'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
          <span className="text-[11px] text-zinc-400 block font-normal mb-0.5">
            {timeframe} Average
          </span>
          <span className="text-sm font-bold text-zinc-900 tabular-nums">
            ₹{periodAvg ? (periodAvg > 10 ? periodAvg.toFixed(2) : periodAvg.toFixed(4)) : '--'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
          <span className="text-[11px] text-zinc-400 block font-normal mb-0.5">
            {timeframe} Movement
          </span>
          <span className={`text-sm font-bold tabular-nums ${
            periodChange > 0 ? 'text-rose-600' : periodChange < 0 ? 'text-emerald-600' : 'text-zinc-900'
          }`}>
            {periodChange > 0 ? `+${periodChange}%` : `${periodChange}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

