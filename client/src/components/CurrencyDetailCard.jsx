import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Bookmark } from 'lucide-react';
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

  const rate = analytics?.currentRate;
  const change24h = analytics?.changes?.['24H'] ?? 0;
  const trend = analytics?.technical?.trend || 'Stable';

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  let trendBadgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
  if (trend === 'Rising' || trend === 'Strengthening') {
    trendBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (trend === 'Falling' || trend === 'Weakening') {
    trendBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <div className="card-clean p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              {code} → INR
            </span>
            <span className="text-sm font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
              {symbol} {code}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-normal">
            {name} against Indian Rupee
          </p>
        </div>

        {/* Status & Bookmark Button */}
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${trendBadgeClass}`}>
            {trend === 'Rising' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend === 'Falling' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend === 'Stable' && <Minus className="w-3.5 h-3.5" />}
            {trend}
          </span>

          <button
            type="button"
            onClick={() => onToggleBookmark?.(code)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isBookmarked
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
            title={isBookmarked ? 'Remove from bookmarked stocks/currencies' : 'Bookmark this currency'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-transform ${
                isBookmarked ? 'fill-amber-500 text-amber-500 scale-110' : 'text-zinc-500'
              }`}
            />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Main Rate and Change Display */}
      <div className="flex flex-wrap items-baseline gap-4">
        <div>
          <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            ₹{rate ? (rate > 10 ? rate.toFixed(2) : rate.toFixed(4)) : '--'}
          </span>
          <span className="text-xs text-zinc-500 ml-2 font-normal">
            per 1 {code}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-base font-semibold ${
            isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-zinc-600'
          }`}>
            {isPositive ? `+${change24h}%` : `${change24h}%`}
          </span>
          <span className="text-xs text-zinc-400 font-normal">(24h)</span>
        </div>
      </div>

      {/* Clean Line Graph */}
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
    </div>
  );
}
