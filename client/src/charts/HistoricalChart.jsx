import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function HistoricalChart({
  data = [],
  pair = 'USD → INR',
  timeframe = '30D',
  onTimeframeChange,
  isPositive = true
}) {
  const timeframes = ['7D', '30D', '90D', '1Y'];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-xs font-normal bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
        <p>No historical rate data available for {pair}.</p>
      </div>
    );
  }

  const rates = data.map(d => Number(d.rate)).filter(r => !isNaN(r) && r > 0);
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 100;
  const padding = (maxRate - minRate) * 0.12 || minRate * 0.01;
  const yDomain = [Math.max(0, minRate - padding), maxRate + padding];

  // Minimalist stroke & gradient
  const strokeColor = '#09090B';
  const gradientId = `chartGrad_${pair.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white px-3 py-2 rounded-lg shadow-clean-lg text-xs space-y-0.5 border border-zinc-800">
          <p className="text-zinc-400 text-[10px] font-medium">
            {point.formattedDate || new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm font-bold text-white tabular-nums">
            ₹{Number(point.rate).toFixed(point.rate > 10 ? 2 : 4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-600">
            Rate Movement
          </span>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            ({data.length} data points)
          </span>
        </div>

        {onTimeframeChange && (
          <div className="flex items-center bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-white text-zinc-900 font-semibold shadow-clean-xs'
                    : 'text-zinc-500 hover:text-zinc-900 font-medium'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#09090B" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#09090B" stopOpacity={0.00} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E4E4E7' }}
              minTickGap={30}
            />
            <YAxis
              domain={yDomain}
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E4E4E7' }}
              tickFormatter={(v) => `₹${v > 10 ? v.toFixed(2) : v.toFixed(3)}`}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={true}
              animationDuration={450}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

