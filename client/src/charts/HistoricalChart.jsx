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
  const timeframes = ['7D', '30D', '90D'];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400 text-xs font-normal">
        No historical data available for {pair}.
      </div>
    );
  }

  const rates = data.map(d => Number(d.rate)).filter(r => !isNaN(r) && r > 0);
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 100;
  const padding = (maxRate - minRate) * 0.1 || minRate * 0.01;
  const yDomain = [Math.max(0, minRate - padding), maxRate + padding];

  const strokeColor = '#18181B'; // Minimalist dark stroke
  const gradientId = `chartGrad_${pair.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-sm text-xs">
          <p className="text-zinc-500 font-normal mb-0.5">
            {point.formattedDate || new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm font-semibold text-zinc-900">
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
        <span className="text-xs text-zinc-500 font-normal">
          Historical rate trend
        </span>
        {onTimeframeChange && (
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-white text-zinc-900 font-semibold shadow-xs'
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
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181B" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#18181B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E4E4E7' }}
              minTickGap={25}
            />
            <YAxis
              domain={yDomain}
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E4E4E7' }}
              tickFormatter={(v) => `₹${v > 10 ? v.toFixed(2) : v.toFixed(3)}`}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke={strokeColor}
              strokeWidth={1.75}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={true}
              animationDuration={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
